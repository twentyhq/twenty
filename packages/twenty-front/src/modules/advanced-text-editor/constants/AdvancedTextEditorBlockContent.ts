import { type JSONContent } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export function createParagraphBlockContent(): JSONContent {
  return { type: TIPTAP_NODE_TYPES.PARAGRAPH };
}

export function createHeadingBlockContent(level: 1 | 2 | 3): JSONContent {
  return { type: TIPTAP_NODE_TYPES.HEADING, attrs: { level } };
}

export function createListBlockContent(
  listType:
    | typeof TIPTAP_NODE_TYPES.BULLET_LIST
    | typeof TIPTAP_NODE_TYPES.ORDERED_LIST,
): JSONContent {
  return {
    type: listType,
    content: [
      {
        type: TIPTAP_NODE_TYPES.LIST_ITEM,
        content: [createParagraphBlockContent()],
      },
    ],
  };
}

export function createColumnBlockContent(): JSONContent {
  return {
    type: TIPTAP_NODE_TYPES.COLUMN,
    content: [createParagraphBlockContent()],
  };
}
