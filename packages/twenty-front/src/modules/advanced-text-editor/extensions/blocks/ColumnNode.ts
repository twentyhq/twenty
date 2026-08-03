import { mergeAttributes, Node } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const ColumnNode = Node.create({
  name: TIPTAP_NODE_TYPES.COLUMN,
  content: 'block+',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      style: {
        default: '',
        parseHTML: (element) => element.getAttribute('style'),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-block-column]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-column': 'true',
        class: 'block-column',
      }),
      0,
    ];
  },
});
