import { convertBlockNoteToTipTap } from '@/object-record/record-field/ui/form-types/utils/convertBlockNoteToTipTap';
import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type Content } from '@tiptap/core';
import {
  isPlainObject,
  isTipTapNode,
  type TipTapNode,
} from 'twenty-shared/utils';

const isTipTapNodeArray = (value: unknown): value is TipTapNode[] =>
  Array.isArray(value) && value.every(isTipTapNode);

const tryParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

export const parseLegacyRecordRichTextDocument = (
  serializedDocument: string,
  enableVariables = true,
): Content => {
  const blocks = tryParseJson(serializedDocument);

  if (
    Array.isArray(blocks) &&
    blocks.some(
      (block) =>
        isPlainObject(block) &&
        ('props' in block ||
          'children' in block ||
          'id' in block ||
          typeof block.content === 'string' ||
          (Array.isArray(block.content) &&
            block.content.some(
              (item) =>
                isPlainObject(item) &&
                ('styles' in item || item.type === 'link'),
            ))),
    )
  ) {
    return {
      type: 'doc',
      content: convertBlockNoteToTipTap(blocks, enableVariables),
    };
  }

  if (isTipTapNodeArray(blocks)) {
    return { type: 'doc', content: blocks };
  }

  return getInitialEditorContent(serializedDocument, enableVariables);
};
