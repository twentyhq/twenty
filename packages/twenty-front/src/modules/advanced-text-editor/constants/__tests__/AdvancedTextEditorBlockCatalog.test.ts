import { ADVANCED_TEXT_EDITOR_BLOCK_CATALOG } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockCatalog';
import { ADVANCED_TEXT_EDITOR_BLOCK_EXTENSIONS } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockExtensions';
import { ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockInsertionRecipes';
import { ADVANCED_TEXT_EDITOR_BLOCK_SLASH_COMMANDS } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockSlashCommands';
import { ADVANCED_TEXT_EDITOR_BLOCK_NODE_TYPES } from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { DEFAULT_SLASH_COMMANDS } from '@/advanced-text-editor/extensions/slash-command/DefaultSlashCommands';

describe('ADVANCED_TEXT_EDITOR_BLOCK_CATALOG', () => {
  it('defines every shared block exactly once', () => {
    expect(Object.keys(ADVANCED_TEXT_EDITOR_BLOCK_CATALOG).sort()).toEqual(
      [...ADVANCED_TEXT_EDITOR_BLOCK_NODE_TYPES].sort(),
    );
  });

  it('derives the extension bundle from catalog entries', () => {
    const catalogExtensionNames = Object.values(
      ADVANCED_TEXT_EDITOR_BLOCK_CATALOG,
    ).flatMap(({ extension }) => (extension === null ? [] : [extension.name]));

    expect(
      ADVANCED_TEXT_EDITOR_BLOCK_EXTENSIONS.map(({ name }) => name),
    ).toEqual(catalogExtensionNames);
  });

  it('creates content matching every insertion recipe node type', () => {
    for (const recipe of ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES) {
      expect(recipe.createContent(() => 'Click here').type).toBe(
        recipe.nodeType,
      );
    }
  });

  it('uses the same recipes for insert controls and slash commands', () => {
    const recipeIds = ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES.map(
      ({ id }) => id,
    );

    expect(new Set(recipeIds).size).toBe(recipeIds.length);
    expect(
      ADVANCED_TEXT_EDITOR_BLOCK_SLASH_COMMANDS.map(({ id }) => id),
    ).toEqual(recipeIds);
  });

  it('keeps document blocks above list commands in the slash menu', () => {
    expect(DEFAULT_SLASH_COMMANDS.map(({ id }) => id)).toEqual([
      'paragraph',
      'h1',
      'h2',
      'h3',
      ...ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES.map(({ id }) => id),
      'bulletList',
      'orderedList',
    ]);
  });
});
