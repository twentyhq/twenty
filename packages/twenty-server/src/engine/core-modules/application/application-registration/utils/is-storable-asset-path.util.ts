import { isAbsoluteUrl } from 'twenty-shared/utils';

import { isImageFilePath } from 'src/engine/core-modules/application/application-registration/utils/is-image-file-path.util';

// Only relative image paths are copied into server file storage; absolute
// urls are served as-is at query time.
export const isStorableAssetPath = (path: string): boolean =>
  !isAbsoluteUrl(path) && isImageFilePath(path);
