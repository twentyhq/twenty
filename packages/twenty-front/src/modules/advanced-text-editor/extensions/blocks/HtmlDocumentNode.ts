import { mergeAttributes } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { HtmlNode } from '@/advanced-text-editor/extensions/blocks/HtmlNode';

export const HtmlDocumentNode = HtmlNode.extend({
  name: TIPTAP_NODE_TYPES.HTML_DOCUMENT,

  parseHTML() {
    return [{ tag: 'div[data-html-document]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-html-document': 'true',
        class: 'block-html',
      }),
    ];
  },
});
