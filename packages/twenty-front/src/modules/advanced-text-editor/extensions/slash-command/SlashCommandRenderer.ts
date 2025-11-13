import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { SlashCommandItem } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import {
  SlashCommandMenu,
  type SlashCommandMenuProps,
} from '@/advanced-text-editor/extensions/slash-command/SlashCommandMenu';
import type { Editor, Range } from '@tiptap/core';

type SlashCommandRendererProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  clientRect: (() => DOMRect | null) | null;
  editor: Editor;
  range: Range;
  query: string;
};

export class SlashCommandRenderer {
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

    const menuProps: SlashCommandMenuProps = {
      items: props.items,
      onSelect: props.command,
      clientRect: props.clientRect,
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
