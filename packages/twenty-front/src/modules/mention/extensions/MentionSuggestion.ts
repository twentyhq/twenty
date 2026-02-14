import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

import { MentionSuggestionMenu } from '@/mention/components/MentionSuggestionMenu';
import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { createSuggestionRenderLifecycle } from '@/ui/suggestion/components/createSuggestionRenderLifecycle';

type MentionSuggestionOptions = {
  searchMentionRecords: (query: string) => Promise<MentionSearchResult[]>;
};

export const MentionSuggestion = Extension.create<MentionSuggestionOptions>({
  name: 'mention-suggestion',

  addOptions: () => ({
    searchMentionRecords: async () => [],
  }),

  addStorage() {
    return {
      searchMentionRecords: this.options.searchMentionRecords,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<MentionSearchResult>({
        pluginKey: MENTION_SUGGESTION_PLUGIN_KEY,
        editor: this.editor,
        char: '@',
        items: async ({ query }) => {
          try {
            return await this.storage.searchMentionRecords(query);
          } catch {
            return [];
          }
        },
        command: ({ editor, range, props: selectedItem }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: 'mentionTag',
              attrs: {
                recordId: selectedItem.recordId,
                objectNameSingular: selectedItem.objectNameSingular,
                label: selectedItem.label,
                imageUrl: selectedItem.imageUrl,
              },
            })
            .insertContent(' ')
            .run();
        },
        render: () =>
          createSuggestionRenderLifecycle(
            {
              component: MentionSuggestionMenu,
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
