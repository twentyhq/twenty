import { ADVANCED_TEXT_EDITOR_BLOCK_CATALOG } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockCatalog';
import { type AnyExtension } from '@tiptap/core';

export const ADVANCED_TEXT_EDITOR_BLOCK_EXTENSIONS: AnyExtension[] =
  Object.values(ADVANCED_TEXT_EDITOR_BLOCK_CATALOG).flatMap(({ extension }) =>
    extension === null ? [] : [extension],
  );
