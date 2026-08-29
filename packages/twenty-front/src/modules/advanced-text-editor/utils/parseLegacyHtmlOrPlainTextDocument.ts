import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type Content } from '@tiptap/core';

const HTML_VOID_TAG_NAMES = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const hasLeadingHtmlTag = (serializedDocument: string): boolean => {
  const documentWithoutLeadingComments = serializedDocument
    .trim()
    .replace(/^(?:<!--[\s\S]*?-->\s*)*/, '');

  if (/^<!doctype\s+html(?:\s[^>]*)?>/i.test(documentWithoutLeadingComments)) {
    return true;
  }

  const openingTagMatch = /^<([a-z][a-z0-9-]*)(?:\s[^<>]*?)?\s*(\/?)>/i.exec(
    documentWithoutLeadingComments,
  );

  if (openingTagMatch === null) {
    return false;
  }

  const tagName = openingTagMatch[1].toLowerCase();

  return (
    openingTagMatch[2] === '/' ||
    HTML_VOID_TAG_NAMES.has(tagName) ||
    new RegExp(`</${tagName}\\s*>`, 'i').test(documentWithoutLeadingComments)
  );
};

export const parseLegacyHtmlOrPlainTextDocument = (
  serializedDocument: string,
): Content =>
  hasLeadingHtmlTag(serializedDocument)
    ? serializedDocument
    : getInitialEditorContent(serializedDocument);
