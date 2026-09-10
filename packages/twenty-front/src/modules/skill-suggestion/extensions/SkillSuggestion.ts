import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

import { SkillSuggestionMenu } from '@/skill-suggestion/components/SkillSuggestionMenu';
import { SKILL_SUGGESTION_PLUGIN_KEY } from '@/skill-suggestion/constants/SkillSuggestionPluginKey';
import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';
import { formatSkillReference } from '@/skill-suggestion/utils/formatSkillReference';
import { createSuggestionRenderLifecycle } from '@/ui/suggestion/components/createSuggestionRenderLifecycle';

type SkillSuggestionOptions = {
  searchSkills: (query: string) => Promise<SkillSuggestionItem[]>;
};

export const SkillSuggestion = Extension.create<SkillSuggestionOptions>({
  name: 'skill-suggestion',

  addOptions: () => ({
    searchSkills: async () => [],
  }),

  addStorage() {
    return {
      searchSkills: this.options.searchSkills,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<SkillSuggestionItem>({
        pluginKey: SKILL_SUGGESTION_PLUGIN_KEY,
        editor: this.editor,
        char: '/',
        items: async ({ query }) => {
          try {
            return await this.storage.searchSkills(query);
          } catch {
            return [];
          }
        },
        command: ({ editor, range, props: selectedItem }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent(`${formatSkillReference(selectedItem.name)} `)
            .run();
        },
        render: () =>
          createSuggestionRenderLifecycle(
            {
              component: SkillSuggestionMenu,
              getMenuProps: ({ items, onSelect, editor, range }) => ({
                items,
                onSelect,
                editor,
                range,
              }),
            },
            this.editor,
          ),
      }),
    ];
  },
});
