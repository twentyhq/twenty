import { ADVANCED_TEXT_EDITOR_BLOCK_CATALOG } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockCatalog';
import { type AdvancedTextEditorBlockInsertionItem } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';

export const ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES: AdvancedTextEditorBlockInsertionItem[] =
  Object.values(ADVANCED_TEXT_EDITOR_BLOCK_CATALOG).flatMap(
    ({ icon, insertionRecipes }) =>
      insertionRecipes.map((recipe) => ({ ...recipe, icon })),
  );
