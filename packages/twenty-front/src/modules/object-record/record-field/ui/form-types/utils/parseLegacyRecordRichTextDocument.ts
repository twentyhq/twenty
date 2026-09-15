import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type Content } from '@tiptap/core';
import { isTipTapNode, type TipTapNode } from 'twenty-shared/utils';

const normalizeLegacyBlockContent = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeLegacyBlockContent);
  }

  if (typeof value !== 'object' || value === null || !('content' in value)) {
    return value;
  }

  const content = value.content;

  if (typeof content === 'string') {
    return {
      ...value,
      content: [{ type: 'text', text: content }],
    };
  }

  return Array.isArray(content)
    ? { ...value, content: content.map(normalizeLegacyBlockContent) }
    : value;
};

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
): Content => {
  const blocks = normalizeLegacyBlockContent(tryParseJson(serializedDocument));

  if (isTipTapNodeArray(blocks)) {
    return { type: 'doc', content: blocks };
  }

  return getInitialEditorContent(serializedDocument);
};
