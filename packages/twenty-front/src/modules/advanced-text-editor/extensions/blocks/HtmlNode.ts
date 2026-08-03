import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { HtmlNodeView } from '@/advanced-text-editor/extensions/blocks/HtmlNodeView';

export const DEFAULT_HTML_BLOCK =
  '<p style="margin: 0;">Edit this HTML in the block settings panel.</p>';

// A raw HTML snippet embedded verbatim in the email. The canvas shows a
// rendered preview; the source is edited in the block settings panel.
export const HtmlNode = Node.create({
  name: TIPTAP_NODE_TYPES.HTML,
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      html: {
        default: DEFAULT_HTML_BLOCK,
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
