import { isString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import {
  getTipTapFileUrlAttributeName,
  isDefined,
  type TipTapNode,
} from 'twenty-shared/utils';

import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';

export const extractFilesFieldFileIdFromTipTapNode = (
  node: TipTapNode,
): string | null => {
  const fileUrlAttributeName = getTipTapFileUrlAttributeName(node.type);

  if (!isDefined(fileUrlAttributeName)) {
    return null;
  }

  const fileUrl = node.attrs?.[fileUrlAttributeName];

  return isString(fileUrl)
    ? extractFileIdFromUrl(fileUrl, FileFolder.FilesField)
    : null;
};
