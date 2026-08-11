import { type Content } from '@tiptap/core';

export type AdvancedTextEditorLegacyDocumentParser = (
  serializedDocument: string,
) => Content;
