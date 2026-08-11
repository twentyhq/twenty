import { isDefined } from 'twenty-shared/utils';

import {
  IMMUTABLE_FILE_CACHE_CONTROL,
  PRESIGNED_URL_NO_STORE_CACHE_CONTROL,
} from 'src/engine/core-modules/file/interfaces/file-folder.interface';

export const getSharedDependenciesBundleCacheControl = ({
  requestedChecksum,
  sharedDependenciesChecksum,
}: {
  requestedChecksum: string | undefined;
  sharedDependenciesChecksum: string | null;
}): string =>
  isDefined(requestedChecksum) &&
  requestedChecksum === sharedDependenciesChecksum
    ? IMMUTABLE_FILE_CACHE_CONTROL
    : PRESIGNED_URL_NO_STORE_CACHE_CONTROL;
