import { type Editor, Extension, type Range } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

import { MentionSuggestionMenu } from '@/mention/components/MentionSuggestionMenu';
import { MENTION_SUGGESTION_PLUGIN_KEY } from '@/mention/constants/MentionSuggestionPluginKey';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import type { MentionSuggestionMenuProps } from '@/mention/types/MentionSuggestionMenuProps';
import { SuggestionRenderer } from '@/ui/suggestion/components/SuggestionRenderer';

type MentionSuggestionRendererProps = {
  items: MentionSearchResult[];
  command: (item: MentionSearchResult) => void;
  clientRect: () => DOMRect | null;
  editor: Editor;
  range: Range;
};

type MentionSuggestionRenderProps = {
  items: MentionSearchResult[];
  command: (item: MentionSearchResult) => void;
  clientRect?: (() => DOMRect | null) | null;
  range: Range;
};

const mentionRendererConfig: {
  component: typeof MentionSuggestionMenu;
  mapProps: (
    props: MentionSuggestionRendererProps,
  ) => MentionSuggestionMenuProps;
} = {
  component: MentionSuggestionMenu,
  mapProps: (props) => ({
    items: props.items,
    onSelect: props.command,
    clientRect: props.clientRect,
    editor: props.editor,
    range: props.range,
  }),
};

type MentionSuggestionOptions = {
  searchMentionRecords: (query: string) => Promise<MentionSearchResult[]>;
};

export const MentionSuggestion = Extension.create<MentionSuggestionOptions>({
  name: 'mention-suggestion',

  addOptions: () => ({
    searchMentionRecords: async () => [],
  }),

  addProseMirrorPlugins() {
    return [
      Suggestion<MentionSearchResult>({
        pluginKey: MENTION_SUGGESTION_PLUGIN_KEY,
        editor: this.editor,
        char: '@',
        items: async ({ query }) => {
          try {
            return await this.options.searchMentionRecords(query);
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
        render: () => {
          let component: SuggestionRenderer<
            MentionSuggestionRendererProps,
            MentionSuggestionMenuProps
          > | null = null;

          const closeMenu = () => {
            if (component !== null) {
              component.destroy();
              component = null;
            }
          };

          return {
            onStart: (props: MentionSuggestionRenderProps) => {
              if (!props.clientRect || props.items.length === 0) {
                return;
              }

              component = new SuggestionRenderer(mentionRendererConfig, {
                items: props.items,
                command: (item: MentionSearchResult) => {
                  props.command(item);
                  closeMenu();
                },
                clientRect: props.clientRect,
                editor: this.editor,
                range: props.range,
              });
            },
            onUpdate: (props: MentionSuggestionRenderProps) => {
              if (!props.clientRect) {
                return;
              }

              if (props.items.length === 0) {
                closeMenu();
                return;
              }

              if (component === null) {
                component = new SuggestionRenderer(mentionRendererConfig, {
                  items: props.items,
                  command: (item: MentionSearchResult) => {
                    props.command(item);
                    closeMenu();
                  },
                  clientRect: props.clientRect,
                  editor: this.editor,
                  range: props.range,
                });
                return;
              }

              component.updateProps({
                items: props.items,
                command: (item: MentionSearchResult) => {
                  props.command(item);
                  closeMenu();
                },
                clientRect: props.clientRect,
                editor: this.editor,
                range: props.range,
              });
            },
            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (props.event.key === 'Escape') {
                closeMenu();
                return true;
              }

              return component?.ref?.onKeyDown?.(props) ?? false;
            },
            onExit: () => {
              closeMenu();
            },
          };
        },
      }),
    ];
  },
});
