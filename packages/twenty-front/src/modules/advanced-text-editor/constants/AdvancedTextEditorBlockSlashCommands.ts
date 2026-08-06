import { ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockInsertionRecipes';
import { type SlashCommandConfig } from '@/advanced-text-editor/extensions/slash-command/types/SlashCommandConfig';
import { i18n } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

export const ADVANCED_TEXT_EDITOR_BLOCK_SLASH_COMMANDS: SlashCommandConfig[] =
  ADVANCED_TEXT_EDITOR_BLOCK_INSERTION_RECIPES.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    icon: recipe.icon,
    keywords: [...recipe.keywords],
    getIsActive: (editor) => editor.isActive(recipe.nodeType),
    getIsVisible: (editor) =>
      isDefined(editor.schema.nodes[recipe.nodeType]) &&
      editor
        .can()
        .insertContent(recipe.createContent((message) => i18n._(message))),
    getOnSelect: (editor, range) => () =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(recipe.createContent((message) => i18n._(message)))
        .run(),
  }));
