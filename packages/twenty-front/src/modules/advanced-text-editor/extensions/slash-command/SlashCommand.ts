import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { Extension, type Editor, type Range } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';

import {
  DEFAULT_SLASH_COMMANDS,
  type SlashCommandConfig,
} from '@/advanced-text-editor/extensions/slash-command/DefaultSlashCommands';
import { type IconComponent } from 'twenty-ui/display';
import SlashCommandMenu, {
  type SlashCommandMenuProps,
} from './SlashCommandMenu';

export type SlashCommandItem = {
  id: string;
  title: string;
  description?: string;
  icon?: IconComponent;
  keywords?: string[];
  isActive?: () => boolean;
  isVisible?: () => boolean;
  onSelect: () => void;
};

type SlashCommandRendererProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  clientRect?: (() => DOMRect | null) | null;
  editor: Editor;
  range: Range;
  query: string;
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
  range: Range,
): SlashCommandItem => ({
  id: config.id,
  title: config.title,
  description: config.description,
  icon: config.icon,
  keywords: config.keywords,
  isActive: () => config.getIsActive(editor),
  isVisible: () => config.getIsVisible(editor),
  onSelect: config.getOnSelect(editor, range),
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

const buildItems = (
  editor: Editor,
  range: Range,
  query: string,
): SlashCommandItem[] => {
  const allItems = DEFAULT_SLASH_COMMANDS.map((config) =>
    createSlashCommandItem(config, editor, range),
  );
  const visibleItems = filterVisibleItems(allItems);
  return filterByQuery(visibleItems, query);
};

class SlashCommandRenderer {
  componentRoot: Root | null = null;
  containerElement: HTMLElement | null = null;
  currentProps: SlashCommandRendererProps | null = null;
  ref: { onKeyDown?: (props: { event: KeyboardEvent }) => boolean } | null =
    null;

  constructor(props: SlashCommandRendererProps) {
    this.containerElement = document.createElement('div');
    document.body.appendChild(this.containerElement);

    this.componentRoot = createRoot(this.containerElement);
    this.currentProps = props;
    this.render(props);
  }

  render(props: SlashCommandRendererProps): void {
    if (!this.componentRoot) {
      return;
    }

    const rect = props.clientRect?.();
    const menuProps: SlashCommandMenuProps = {
      items: props.items,
      onSelect: props.command,
      clientRect: rect ?? null,
      editor: props.editor,
      range: props.range,
      query: props.query,
    };

    this.componentRoot.render(
      createElement(SlashCommandMenu, {
        ...menuProps,
        ref: (
          ref: {
            onKeyDown?: (props: { event: KeyboardEvent }) => boolean;
          } | null,
        ) => {
          this.ref = ref;
        },
      }),
    );
  }

  updateProps(props: Partial<SlashCommandRendererProps>): void {
    if (!this.componentRoot || !this.currentProps) {
      return;
    }

    const updatedProps = { ...this.currentProps, ...props };
    this.currentProps = updatedProps;
    this.render(updatedProps);
  }

  destroy(): void {
    if (this.componentRoot !== null) {
      this.componentRoot.unmount();
      this.componentRoot = null;
    }

    if (this.containerElement !== null) {
      this.containerElement.remove();
      this.containerElement = null;
    }

    this.currentProps = null;
    this.ref = null;
  }
}

const createSlashCommandRenderer = (editor: Editor) => {
  let component: SlashCommandRenderer | null = null;

  return {
    onStart: (props: SuggestionRenderProps) => {
      const rect = props.clientRect?.();
      if (!rect) {
        return;
      }

      component = new SlashCommandRenderer({
        items: props.items,
        command: props.command,
        clientRect: () => rect,
        editor,
        range: props.range,
        query: props.query,
      });
    },
    onUpdate: (props: SuggestionRenderProps) => {
      if (component === null) {
        return;
      }

      const rect = props.clientRect?.();
      if (!rect) {
        return;
      }

      if (props.items.length === 0) {
        component.destroy();
        component = null;
        return;
      }

      component.updateProps({
        items: props.items,
        command: props.command,
        clientRect: () => rect,
        editor,
        range: props.range,
        query: props.query,
      });
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === 'Escape') {
        if (component !== null) {
          component.destroy();
          component = null;
        }
        return true;
      }

      return component?.ref?.onKeyDown?.(props) ?? false;
    },
    onExit: () => {
      if (component === null) {
        return;
      }

      component.destroy();
      component = null;
    },
  };
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
          props.onSelect(editor, range);
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestions,
        items: ({ query, editor: ed }) =>
          buildItems(ed, ed.state.selection, query),
        render: () => createSlashCommandRenderer(this.editor),
      }),
    ];
  },
});
