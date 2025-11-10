import { i18n } from '@lingui/core';
import { Extension, type Editor, type Range } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { type IconComponent } from 'twenty-ui/display';

import {
  DEFAULT_SLASH_COMMANDS,
  type SlashCommandConfig,
} from '@/advanced-text-editor/extensions/slash-command/DefaultSlashCommands';
import { SlashCommandRenderer } from '@/advanced-text-editor/extensions/slash-command/SlashCommandRenderer';

export type SlashCommandItem = {
  id: string;
  title: string;
  description?: string;
  icon?: IconComponent;
  keywords?: string[];
  isActive?: () => boolean;
  isVisible?: () => boolean;
  command: (options: { editor: Editor; range: Range }) => void;
};

type SuggestionRenderProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  clientRect?: (() => DOMRect | null) | null;
  range: Range;
  query: string;
};

const createSlashCommandItem = (
  config: SlashCommandConfig,
  editor: Editor,
): SlashCommandItem => ({
  id: config.id,
  title: i18n._(config.title),
  description: i18n._(config.description),
  icon: config.icon,
  keywords: config.keywords.map((keyword) => i18n._(keyword)),
  isActive: () => config.getIsActive(editor),
  isVisible: () => config.getIsVisible(editor),
  command: ({ editor: ed, range }) => {
    const onSelect = config.getOnSelect(ed, range);
    onSelect();
  },
});

const filterVisibleItems = (items: SlashCommandItem[]): SlashCommandItem[] => {
  return items.filter((item) => item.isVisible?.() ?? true);
};

const filterByQuery = (
  items: SlashCommandItem[],
  query: string,
): SlashCommandItem[] => {
  if (!query.trim()) {
    return items;
  }

  const normalizedQuery = query.trim().toLowerCase();
  return items.filter((item) => {
    const searchableText =
      `${item.title} ${(item.keywords ?? []).join(' ')}`.toLowerCase();
    return searchableText.includes(normalizedQuery);
  });
};

const buildItems = (editor: Editor, query: string): SlashCommandItem[] => {
  const allItems = DEFAULT_SLASH_COMMANDS.map((config) =>
    createSlashCommandItem(config, editor),
  );
  const visibleItems = filterVisibleItems(allItems);
  return filterByQuery(visibleItems, query);
};

export type SlashCommandOptions = {
  suggestions: Omit<SuggestionOptions, 'editor'>;
};

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slash-command',
  addOptions: () => {
    return {
      suggestions: {
        char: '/',
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestions,
        items: ({ query, editor: ed }) => buildItems(ed, query),
        render: () => {
          let component: SlashCommandRenderer | null = null;

          const closeMenu = () => {
            if (component !== null) {
              component.destroy();
              component = null;
            }
          };

          return {
            onStart: (props: SuggestionRenderProps) => {
              if (!props.clientRect) {
                return;
              }

              component = new SlashCommandRenderer({
                items: props.items,
                command: (item: SlashCommandItem) => {
                  props.command(item);
                  closeMenu();
                },
                clientRect: props.clientRect,
                editor: this.editor,
                range: props.range,
                query: props.query,
              });
            },
            onUpdate: (props: SuggestionRenderProps) => {
              if (component === null) {
                return;
              }

              if (!props.clientRect) {
                return;
              }

              if (props.items.length === 0) {
                closeMenu();
                return;
              }

              component.updateProps({
                items: props.items,
                command: (item: SlashCommandItem) => {
                  props.command(item);
                  closeMenu();
                },
                clientRect: props.clientRect,
                editor: this.editor,
                range: props.range,
                query: props.query,
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
