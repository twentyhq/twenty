import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { MentionSuggestionMenu } from '@/mention/components/MentionSuggestionMenu';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import type { MentionSuggestionMenuProps } from '@/mention/types/MentionSuggestionMenuProps';
import type { Editor, Range } from '@tiptap/core';

type MentionSuggestionRendererProps = {
  items: MentionSearchResult[];
  command: (item: MentionSearchResult) => void;
  clientRect: (() => DOMRect | null) | null;
  editor: Editor;
  range: Range;
};

export class MentionSuggestionRenderer {
  componentRoot: Root | null = null;
  containerElement: HTMLElement | null = null;
  currentProps: MentionSuggestionRendererProps | null = null;
  ref: { onKeyDown?: (props: { event: KeyboardEvent }) => boolean } | null =
    null;

  constructor(props: MentionSuggestionRendererProps) {
    this.containerElement = document.createElement('div');
    document.body.appendChild(this.containerElement);

    this.componentRoot = createRoot(this.containerElement);
    this.currentProps = props;
    this.render(props);
  }

  render(props: MentionSuggestionRendererProps): void {
    if (!this.componentRoot) {
      return;
    }

    const menuProps: MentionSuggestionMenuProps = {
      items: props.items,
      onSelect: props.command,
      clientRect: props.clientRect,
      editor: props.editor,
      range: props.range,
    };

    this.componentRoot.render(
      createElement(MentionSuggestionMenu, {
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

  updateProps(props: Partial<MentionSuggestionRendererProps>): void {
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
