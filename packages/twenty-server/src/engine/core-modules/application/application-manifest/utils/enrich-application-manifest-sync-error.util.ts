import { msg } from '@lingui/core/macro';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { findManifestEntityDescriptorByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { getFlatEntityMapsExceptionContext } from 'src/engine/metadata-modules/flat-entity/utils/get-flat-entity-maps-exception-context.util';

export const enrichApplicationManifestSyncError = ({
  error,
  manifest,
}: {
  error: unknown;
  manifest: Manifest;
}): unknown => {
  const context = getFlatEntityMapsExceptionContext(error);

  if (!isDefined(context)) {
    return error;
  }

  const applicationDisplayName = manifest.application.displayName;
  const originalMessage =
    error instanceof Error ? error.message : String(error);

  const descriptor = isDefined(context.universalIdentifier)
    ? findManifestEntityDescriptorByUniversalIdentifier({
        manifest,
        universalIdentifier: context.universalIdentifier,
      })
    : undefined;

  if (isDefined(descriptor)) {
    const { entityKind, label } = descriptor;
    const humanEntity = isDefined(label)
      ? `${entityKind} "${label}"`
      : entityKind;
    const developerDetail = isDefined(label)
      ? `${entityKind}: ${label}`
      : entityKind;

    return new ApplicationException(
      `Synchronizing application '${applicationDisplayName}' failed [${developerDetail}]: ${originalMessage}`,
      ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED,
      {
        userFriendlyMessage: msg`We couldn't sync metadata for "${applicationDisplayName}". Its ${humanEntity} conflicts with your workspace schema. Run 'yarn twenty plan' to inspect schema differences.`,
        context,
      },
    );
  }

  return new ApplicationException(
    `Synchronizing application '${applicationDisplayName}' failed: ${originalMessage}`,
    ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED,
    {
      userFriendlyMessage: msg`We couldn't sync metadata for "${applicationDisplayName}" because some of its metadata conflicts with your workspace schema. Run 'yarn twenty plan' to inspect schema differences.`,
      context,
    },
  );
};
