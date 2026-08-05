import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type Content, type JSONContent } from '@tiptap/core';

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
  const blocks = tryParseJson(serializedDocument);

  if (Array.isArray(blocks)) {
    return { type: 'doc', content: blocks as JSONContent[] };
  }

  return getInitialEditorContent(serializedDocument);
};
