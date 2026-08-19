import { type Content } from '@tiptap/core';
import { marked } from 'marked';

export const parseLegacyMarkdownDocument = (
  serializedDocument: string,
): Content => marked.parse(serializedDocument, { async: false }) as string;
