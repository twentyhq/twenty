import { type Content } from '@tiptap/core';
import { looksLikeHtml } from 'twenty-shared/utils';

import { parseLegacyPlainTextDocument } from '@/advanced-text-editor/utils/parseLegacyPlainTextDocument';

// Mirrors the server's email-tool string contract: HTML as-is, else plain text.
export const parseLegacyEmailBodyDocument = (
  serializedDocument: string,
): Content =>
  looksLikeHtml(serializedDocument)
    ? serializedDocument
    : parseLegacyPlainTextDocument(serializedDocument);
