import { isString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';

export const extractFilesFieldFileIdFromBlocknoteBlock = (
  block: unknown,
): string | null => {
  if (!isPlainObject(block) || !isPlainObject(block.props)) {
    return null;
  }

  const fileUrl = block.props.url;

  return isString(fileUrl)
    ? extractFileIdFromUrl(fileUrl, FileFolder.FilesField)
    : null;
};
