import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { type Content } from '@tiptap/core';
import { isDefined } from 'twenty-shared/utils';

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

  const [, openingTagName, selfClosingSlash] = openingTagMatch ?? [];

  if (!isDefined(openingTagName)) {
    return false;
  }

  const tagName = openingTagName.toLowerCase();

  return (
    selfClosingSlash === '/' ||
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
