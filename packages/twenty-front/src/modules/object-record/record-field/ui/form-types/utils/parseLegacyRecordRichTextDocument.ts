import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type Content, type JSONContent } from '@tiptap/core';

const isJsonContentNode = (value: unknown): value is JSONContent => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as { content?: unknown; type?: unknown };

  return (
    typeof candidate.type === 'string' &&
    (candidate.content === undefined ||
      (Array.isArray(candidate.content) &&
        candidate.content.every(isJsonContentNode)))
  );
};

export const parseLegacyRecordRichTextDocument = (
  serializedDocument: string,
): Content => {
  try {
    const blocks: unknown = JSON.parse(serializedDocument);

    if (Array.isArray(blocks) && blocks.every(isJsonContentNode)) {
      return { type: 'doc', content: blocks };
    }
  } catch {
    // Fall through to the older Markdown/plain-text representation.
  }

  return getInitialEditorContent(serializedDocument);
};
