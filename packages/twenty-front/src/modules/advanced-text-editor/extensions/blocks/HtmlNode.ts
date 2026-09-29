import { type Editor, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { HtmlNodeView } from '@/advanced-text-editor/extensions/blocks/HtmlNodeView';

type HtmlNodeOptions = {
  isInlineEditable: boolean;
  defaultHtml: string;
};

type HtmlNodeStorage = {
  focusedHtmlEditor: Editor | null;
};

declare module '@tiptap/core' {
  interface Storage {
    html?: HtmlNodeStorage;
  }
}

export const HtmlNode = Node.create<HtmlNodeOptions, HtmlNodeStorage>({
  name: TIPTAP_NODE_TYPES.HTML,
  group: 'block',
  atom: true,

  selectable() {
    return !this.options.isInlineEditable;
  },

  addOptions() {
    return {
      isInlineEditable: false,
      defaultHtml:
        '<p style="margin: 0;">Edit this HTML in the block settings panel.</p>',
    };
  },

  addStorage() {
    return {
      focusedHtmlEditor: null,
    };
  },

  onFocus() {
    this.storage.focusedHtmlEditor = null;
  },

  addAttributes() {
    return {
      html: {
        default: this.options.defaultHtml,
        parseHTML: (element) => element.getAttribute('data-html'),
        renderHTML: (attributes) => ({ 'data-html': attributes.html }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-html-block]' }];
  },

  renderHTML() {
    return ['div', { 'data-html-block': 'true', class: 'block-html' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(HtmlNodeView);
  },
});
