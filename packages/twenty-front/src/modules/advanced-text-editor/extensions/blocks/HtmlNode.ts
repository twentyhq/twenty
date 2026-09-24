import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { HtmlNodeView } from '@/advanced-text-editor/extensions/blocks/HtmlNodeView';

type HtmlNodeOptions = {
  isInlineEditable: boolean;
  defaultHtml: string;
};

export const HtmlNode = Node.create<HtmlNodeOptions>({
  name: TIPTAP_NODE_TYPES.HTML,
  group: 'block',
  atom: true,

  addOptions() {
    return {
      isInlineEditable: false,
      defaultHtml:
        '<p style="margin: 0;">Edit this HTML in the block settings panel.</p>',
    };
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
