import type { Editor, Range } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';

type SuggestionMenuRef = {
  onKeyDown?: (props: { event: KeyboardEvent }) => boolean;
};

type SuggestionCallbackProps<TItem> = {
  items: TItem[];
  command: (item: TItem) => void;
  clientRect?: (() => DOMRect | null) | null;
  range: Range;
  query: string;
};

// Matches Tiptap's ReactRenderer generic constraint
type AnyRecord = Record<string, any>;

type SuggestionRenderLifecycleConfig<TItem, TMenuProps extends AnyRecord> = {
  component: React.ComponentType<TMenuProps>;
  getMenuProps: (args: {
    items: TItem[];
    onSelect: (item: TItem) => void;
    editor: Editor;
    range: Range;
    query: string;
  }) => TMenuProps;
  // Shown at once and kept above the searched items, which arrive later
  getLocalItems?: (query: string) => TItem[];
};

export const createSuggestionRenderLifecycle = <
  TItem,
  TMenuProps extends AnyRecord,
>(
  config: SuggestionRenderLifecycleConfig<TItem, TMenuProps>,
  editor: Editor,
) => {
  let renderer: ReactRenderer<SuggestionMenuRef, TMenuProps> | null = null;

  const closeMenu = () => {
    if (renderer !== null) {
      renderer.destroy();
      renderer = null;
    }
  };

  const getItems = (props: SuggestionCallbackProps<TItem>) => [
    ...(config.getLocalItems?.(props.query) ?? []),
    ...props.items,
  ];

  const buildMenuProps = (
    props: SuggestionCallbackProps<TItem>,
    items: TItem[],
  ) =>
    config.getMenuProps({
      items,
      onSelect: (item: TItem) => {
        props.command(item);
        closeMenu();
      },
      editor,
      range: props.range,
      query: props.query,
    });

  const createRenderer = (
    props: SuggestionCallbackProps<TItem>,
    items: TItem[],
  ) => {
    renderer = new ReactRenderer(config.component, {
      editor,
      props: buildMenuProps(props, items),
    });
    document.body.appendChild(renderer.element);
  };

  return {
    onStart: (props: SuggestionCallbackProps<TItem>) => {
      if (!props.clientRect) {
        return;
      }

      const items = getItems(props);

      if (items.length === 0) {
        return;
      }

      createRenderer(props, items);
    },
    onUpdate: (props: SuggestionCallbackProps<TItem>) => {
      if (!props.clientRect) {
        return;
      }

      const items = getItems(props);

      if (items.length === 0) {
        closeMenu();
        return;
      }

      if (renderer === null) {
        createRenderer(props, items);
        return;
      }

      renderer.updateProps(buildMenuProps(props, items));
    },
    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === 'Escape') {
        closeMenu();
        return true;
      }

      return renderer?.ref?.onKeyDown?.(props) ?? false;
    },
    onExit: () => {
      closeMenu();
    },
  };
};
