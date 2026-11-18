import { msg } from '@lingui/core/macro';
import { isDeepStrictEqual } from 'node:util';
import { isSourceFileManifestList } from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ApplicationSourceResource } from 'src/engine/core-modules/application/application-manifest/types/application-source-resource.type';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const validateApplicationSourceInventoryOrThrow = ({
  inventory,
  resource,
}: {
  inventory: unknown;
  resource: Pick<ApplicationSourceResource, 'metadata' | 'sourcePath'>;
}) => {
  if (!isPlainObject(inventory)) {
    throw new ApplicationException(
      doNotTranslate('Stored application source inventory is invalid'),
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }
  if (!isDefined(inventory.sourceFiles)) {
    return undefined;
  }
  if (
    Object.entries(resource.metadata).some(
      ([key, value]) => !isDeepStrictEqual(inventory[key], value),
    ) ||
    !isSourceFileManifestList(inventory.sourceFiles) ||
    !inventory.sourceFiles.some((file) => file.filePath === resource.sourcePath)
  ) {
    throw new ApplicationException(
      doNotTranslate(
        'Source inventory does not match the deployed application definition; apply or publish again',
      ),
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`Apply or publish the application again to restore its application sources.`,
      },
    );
  }
  return inventory.sourceFiles;
};
