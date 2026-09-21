import { type JSONContent } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export function createParagraphBlockContent(): JSONContent {
  return { type: TIPTAP_NODE_TYPES.PARAGRAPH };
}

export function createColumnBlockContent(): JSONContent {
  return {
    type: TIPTAP_NODE_TYPES.COLUMN,
    content: [createParagraphBlockContent()],
  };
}
