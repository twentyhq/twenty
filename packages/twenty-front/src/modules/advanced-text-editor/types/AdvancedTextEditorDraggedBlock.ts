import { type AdvancedTextEditorBlockRange } from '@/advanced-text-editor/types/AdvancedTextEditorBlockRange';
import { type JSONContent } from '@tiptap/core';
import { type IconComponent } from 'twenty-ui/icon';

export type AdvancedTextEditorDraggedBlock = {
  Icon: IconComponent;
  label: string;
  content: JSONContent;
  sourceRange: AdvancedTextEditorBlockRange | null;
};
