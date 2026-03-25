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

  const buildMenuProps = (props: SuggestionCallbackProps<TItem>) =>
    config.getMenuProps({
      items: props.items,
      onSelect: (item: TItem) => {
        props.command(item);
        closeMenu();
      },
      editor,
      range: props.range,
      query: props.query,
    });

  const createRenderer = (props: SuggestionCallbackProps<TItem>) => {
    renderer = new ReactRenderer(config.component, {
      editor,
      props: buildMenuProps(props),
    });
    document.body.appendChild(renderer.element);
  };

  return {
    onStart: (props: SuggestionCallbackProps<TItem>) => {
      if (!props.clientRect || props.items.length === 0) {
        return;
      }

      createRenderer(props);
    },
    onUpdate: (props: SuggestionCallbackProps<TItem>) => {
      if (!props.clientRect) {
        return;
      }

      if (props.items.length === 0) {
        closeMenu();
        return;
      }

      if (renderer === null) {
        createRenderer(props);
        return;
      }

      renderer.updateProps(buildMenuProps(props));
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
