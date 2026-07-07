import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

const APPLICATION_MANIFESTS_SUBFOLDER = 'manifests';

const APPLICATION_MANIFEST_DEV_FILE_NAME = 'dev';

const SAFE_VERSION_FILE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._+-]*$/;

const CONTENT_HASH_LENGTH = 16;

export const buildApplicationManifestResourcePath = ({
  applicationRegistrationId,
  sourceType,
  version,
  serializedManifest,
}: {
  applicationRegistrationId: string;
  sourceType: ApplicationRegistrationSourceType;
  version?: string | null;
  serializedManifest: string;
}): string => {
  if (sourceType === ApplicationRegistrationSourceType.LOCAL) {
    return `${applicationRegistrationId}/${APPLICATION_MANIFESTS_SUBFOLDER}/${APPLICATION_MANIFEST_DEV_FILE_NAME}.json`;
  }

  const fileName =
    isDefined(version) && SAFE_VERSION_FILE_NAME_PATTERN.test(version)
      ? version
      : createHash('sha256')
          .update(serializedManifest)
          .digest('hex')
          .slice(0, CONTENT_HASH_LENGTH);

  return `${applicationRegistrationId}/${APPLICATION_MANIFESTS_SUBFOLDER}/${fileName}.json`;
};
