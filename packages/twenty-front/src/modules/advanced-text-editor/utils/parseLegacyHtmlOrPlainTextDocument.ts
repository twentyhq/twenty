import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type Content } from '@tiptap/core';

const hasLeadingHtmlTag = (serializedDocument: string): boolean =>
  /^(?:(?:<!--[\s\S]*?-->|<!doctype\s+html[^>]*>)\s*)*<[a-z][a-z0-9]*(?:\s[^>]*)?>/i.test(
    serializedDocument.trim(),
  );

export const parseLegacyHtmlOrPlainTextDocument = (
  serializedDocument: string,
): Content =>
  hasLeadingHtmlTag(serializedDocument)
    ? serializedDocument
    : getInitialEditorContent(serializedDocument);
