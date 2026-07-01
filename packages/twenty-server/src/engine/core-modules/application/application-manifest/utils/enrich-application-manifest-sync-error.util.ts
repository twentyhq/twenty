import { msg } from '@lingui/core/macro';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { findManifestEntityDescriptorByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import { getFlatEntityMapsExceptionContext } from 'src/engine/metadata-modules/flat-entity/utils/get-flat-entity-maps-exception-context.util';

// Turns a low-level flat-entity map failure into an actionable application
// installation error: the developer message keeps the technical detail for
// Sentry, while the user-facing message names the application (and the
// offending manifest entity when it can be resolved). Non flat-entity errors
// keep their original type and handling.
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
    const entityLabel = descriptor.label;
    const entityKind = descriptor.entityKind;

    return new ApplicationException(
      `Installing application '${applicationDisplayName}' failed [${entityKind}: ${entityLabel}]: ${originalMessage}`,
      ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED,
      {
        userFriendlyMessage: msg`We couldn't install "${applicationDisplayName}". Its ${entityLabel} conflicts with existing data in your workspace.`,
      },
    );
  }

  return new ApplicationException(
    `Installing application '${applicationDisplayName}' failed: ${originalMessage}`,
    ApplicationExceptionCode.APPLICATION_INSTALLATION_FAILED,
    {
      userFriendlyMessage: msg`We couldn't install "${applicationDisplayName}" because some of its data conflicts with existing data in your workspace.`,
    },
  );
};
