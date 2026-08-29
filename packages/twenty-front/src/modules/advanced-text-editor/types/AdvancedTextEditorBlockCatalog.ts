import { type MessageDescriptor } from '@lingui/core';
import { type AnyExtension, type JSONContent } from '@tiptap/core';
import { TIPTAP_NODE_TYPES, type TipTapNodeType } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';

export const ADVANCED_TEXT_EDITOR_BLOCK_NODE_TYPES = [
  TIPTAP_NODE_TYPES.SECTION,
  TIPTAP_NODE_TYPES.COLUMNS,
  TIPTAP_NODE_TYPES.COLUMN,
  TIPTAP_NODE_TYPES.BUTTON,
  TIPTAP_NODE_TYPES.DIVIDER,
  TIPTAP_NODE_TYPES.HTML,
  TIPTAP_NODE_TYPES.IMAGE,
] as const satisfies readonly TipTapNodeType[];

export type AdvancedTextEditorBlockNodeType =
  (typeof ADVANCED_TEXT_EDITOR_BLOCK_NODE_TYPES)[number];

export type AdvancedTextEditorSettingInput =
  | 'text'
  | 'color'
  | 'box'
  | 'size'
  | 'alignment'
  | 'textarea';

export type AdvancedTextEditorBlockSetting = {
  label: MessageDescriptor;
  kind: 'style' | 'attribute';
  property: string;
  input: AdvancedTextEditorSettingInput;
  placeholder?: string;
};

export type AdvancedTextEditorBlockInsertionRecipe = {
  id: string;
  nodeType: AdvancedTextEditorBlockNodeType;
  title: MessageDescriptor;
  description: MessageDescriptor;
  keywords: readonly MessageDescriptor[];
  createContent: (
    translate: (message: MessageDescriptor) => string,
  ) => JSONContent;
};

export type AdvancedTextEditorBlockDefinition = {
  label: MessageDescriptor;
  icon: IconComponent;
  extension: AnyExtension | null;
  insertionRecipes: readonly AdvancedTextEditorBlockInsertionRecipe[];
  settingsFields: readonly AdvancedTextEditorBlockSetting[];
};

export type AdvancedTextEditorBlockInsertionItem =
  AdvancedTextEditorBlockInsertionRecipe &
    Pick<AdvancedTextEditorBlockDefinition, 'icon'>;

export const isAdvancedTextEditorBlockNodeType = (
  nodeType: string,
): nodeType is AdvancedTextEditorBlockNodeType =>
  ADVANCED_TEXT_EDITOR_BLOCK_NODE_TYPES.some(
    (blockNodeType) => blockNodeType === nodeType,
  );
