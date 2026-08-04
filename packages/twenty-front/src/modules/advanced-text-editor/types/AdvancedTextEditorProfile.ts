import { type AdvancedTextEditorContentType } from '@/advanced-text-editor/types/AdvancedTextEditorContentType';
import { type AdvancedTextEditorExtensionContext } from '@/advanced-text-editor/types/AdvancedTextEditorExtensionContext';
import { type AnyExtension } from '@tiptap/core';

export type AdvancedTextEditorChrome = 'field' | 'document';

export type AdvancedTextEditorProfile = {
  contentType: AdvancedTextEditorContentType;
  chrome: AdvancedTextEditorChrome;
  minHeight: number;
  enableFullScreen: boolean;
  buildExtensions: (
    context: AdvancedTextEditorExtensionContext,
  ) => AnyExtension[];
  documentExtension?: AnyExtension;
};
