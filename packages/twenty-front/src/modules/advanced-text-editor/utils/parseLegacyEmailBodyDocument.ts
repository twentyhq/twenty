import { type Content } from '@tiptap/core';
import { looksLikeHtml } from 'twenty-shared/utils';

import { parseLegacyPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyPlainTextDocument';

// Same string contract as the server's email tools: HTML markup as-is,
// anything else as plain text, so the editor shows what will be sent.
export const parseLegacyEmailBodyDocument = (
  serializedDocument: string,
): Content =>
  looksLikeHtml(serializedDocument)
    ? serializedDocument
    : parseLegacyPlainTextDocument(serializedDocument);
