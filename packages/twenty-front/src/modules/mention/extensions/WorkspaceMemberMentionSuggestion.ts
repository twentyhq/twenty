import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

import { MentionSuggestionMenu } from '@/mention/components/MentionSuggestionMenu';
import { WORKSPACE_MEMBER_MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/WorkspaceMemberMentionSuggestionPluginKey';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';
import { createSuggestionRenderLifecycle } from '@/ui/suggestion/components/createSuggestionRenderLifecycle';

type WorkspaceMemberMentionSuggestionOptions = {
  searchWorkspaceMembers: (query: string) => MentionSearchResult[];
};

export const WorkspaceMemberMentionSuggestion =
  Extension.create<WorkspaceMemberMentionSuggestionOptions>({
    name: 'workspace-member-mention-suggestion',

    addOptions: () => ({
      searchWorkspaceMembers: () => [],
    }),

    addStorage() {
      return {
        searchWorkspaceMembers: this.options.searchWorkspaceMembers,
      };
    },

    addProseMirrorPlugins() {
      return [
        Suggestion<MentionSearchResult>({
          pluginKey: WORKSPACE_MEMBER_MENTION_SUGGESTION_PLUGIN_KEY,
          editor: this.editor,
          char: '@',
          items: ({ query }) => this.storage.searchWorkspaceMembers(query),
          command: ({ editor, range, props: selectedItem }) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent(
                getMentionTagContent({
                  ...selectedItem,
                  shouldAddAsParticipant: true,
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
              },
              this.editor,
            ),
        }),
      ];
    },
  });
