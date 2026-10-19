import { type AdvancedTextEditorExtensionContext } from '@/advanced-text-editor/types/AdvancedTextEditorExtensionContext';
import { type AdvancedTextEditorLegacyDocumentParser } from '@/advanced-text-editor/types/AdvancedTextEditorLegacyDocumentParser';
import { type AnyExtension } from '@tiptap/core';

export type AdvancedTextEditorChrome = 'field' | 'document';

export type AdvancedTextEditorVariant = 'app' | 'email';

export type AdvancedTextEditorProfile = {
  chrome: AdvancedTextEditorChrome;
  variant: AdvancedTextEditorVariant;
  minHeight: number;
  enableFullScreen: boolean;
  buildExtensions: (
    context: AdvancedTextEditorExtensionContext,
  ) => AnyExtension[];
  documentExtension?: AnyExtension;
  parseLegacyDocument?: AdvancedTextEditorLegacyDocumentParser;
};
