import { type AdvancedTextEditorVariant } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { type Editor } from '@tiptap/core';

export type AdvancedTextEditorComponentProps = {
  readonly: boolean | undefined;
  editor: Editor;
  minHeight: number;
  variant: AdvancedTextEditorVariant;
};
