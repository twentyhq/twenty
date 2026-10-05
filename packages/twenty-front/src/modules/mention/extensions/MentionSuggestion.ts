import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

import { MentionSuggestionMenu } from '@/mention/components/MentionSuggestionMenu';
import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import { MENTION_SUGGESTION_TEAMMATE_LIMIT } from '@/mention/constants/MentionSuggestionTeammateLimit';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';
import { isWorkspaceMemberMentionSearchResult } from '@/mention/utils/isWorkspaceMemberMentionSearchResult';
import { createSuggestionRenderLifecycle } from '@/ui/suggestion/components/createSuggestionRenderLifecycle';

type MentionSuggestionOptions = {
  searchMentionRecords: (query: string) => Promise<MentionSearchResult[]>;
  searchWorkspaceMembers: (query: string) => MentionSearchResult[];
};

export const MentionSuggestion = Extension.create<MentionSuggestionOptions>({
  name: 'mention-suggestion',

  addOptions: () => ({
    searchMentionRecords: async () => [],
    searchWorkspaceMembers: () => [],
  }),

  addStorage() {
    return {
      searchMentionRecords: this.options.searchMentionRecords,
      searchWorkspaceMembers: this.options.searchWorkspaceMembers,
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
            .insertContent(
              getMentionTagContent({
                ...selectedItem,
                shouldAddAsParticipant:
                  isWorkspaceMemberMentionSearchResult(selectedItem),
              }),
            )
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
              // Teammates are searched locally, so they show before records
              // load; all of them once a name is typed, else only a few
              getLocalItems: (query) => {
                const workspaceMemberResults =
                  this.storage.searchWorkspaceMembers(query);

                return query === ''
                  ? workspaceMemberResults.slice(
                      0,
                      MENTION_SUGGESTION_TEAMMATE_LIMIT,
                    )
                  : workspaceMemberResults;
              },
            },
            this.editor,
          ),
      }),
    ];
  },
});
