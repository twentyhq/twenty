import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  isPlainObject,
  isTipTapNode,
  parseJson,
  type TipTapNode,
} from 'twenty-shared/utils';

import { extractFilesFieldFileIdFromBlocknoteBlock } from 'src/engine/core-modules/file/files-field/utils/extract-files-field-file-id-from-blocknote-block.util';
import { extractFilesFieldFileIdFromTipTapNode } from 'src/engine/core-modules/file/files-field/utils/extract-files-field-file-id-from-tiptap-node.util';

const collectTipTapNodeFileIds = ({
  node,
  fileIds,
}: {
  node: TipTapNode;
  fileIds: Set<string>;
}): void => {
  const fileId = extractFilesFieldFileIdFromTipTapNode(node);

  if (isDefined(fileId)) {
    fileIds.add(fileId);
  }

  for (const childNode of node.content ?? []) {
    collectTipTapNodeFileIds({ node: childNode, fileIds });
  }
};

export const extractFilesFieldFileIdsFromRichTextValue = (
  richTextValue: unknown,
): Set<string> => {
  const fileIds = new Set<string>();

  if (!isPlainObject(richTextValue)) {
    return fileIds;
  }

  const tiptapDocument = isNonEmptyString(richTextValue.tiptap)
    ? parseJson<unknown>(richTextValue.tiptap)
    : undefined;

  if (isTipTapNode(tiptapDocument)) {
    collectTipTapNodeFileIds({ node: tiptapDocument, fileIds });
  }

  const blocknoteBlocks = isNonEmptyString(richTextValue.blocknote)
    ? parseJson<unknown>(richTextValue.blocknote)
    : undefined;

  if (Array.isArray(blocknoteBlocks)) {
    for (const block of blocknoteBlocks) {
      const fileId = extractFilesFieldFileIdFromBlocknoteBlock(block);

      if (isDefined(fileId)) {
        fileIds.add(fileId);
      }
    }
  }

  return fileIds;
};
