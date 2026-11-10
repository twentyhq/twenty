import { extname } from 'path';

import { REMOTE_FILE_SAFE_EXTENSION_PATTERN } from 'src/engine/core-modules/file/files-field/constants/remote-file-safe-extension-pattern.constant';
import { REMOTE_FILE_UNKNOWN_CONTENT_EXTENSION } from 'src/engine/core-modules/file/files-field/constants/remote-file-unknown-content-extension.constant';

export const buildRemoteFileExtension = (filename: string): string => {
  const extension = extname(filename).slice(1).toLowerCase();

  return REMOTE_FILE_SAFE_EXTENSION_PATTERN.test(extension)
    ? extension
    : REMOTE_FILE_UNKNOWN_CONTENT_EXTENSION;
};
