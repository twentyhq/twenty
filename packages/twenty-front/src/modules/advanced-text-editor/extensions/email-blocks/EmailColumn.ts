import { mergeAttributes, Node } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const EmailColumn = Node.create({
  name: TIPTAP_NODE_TYPES.EMAIL_COLUMN,
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
    return [{ tag: 'div[data-email-column]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-email-column': 'true',
        class: 'email-column',
      }),
      0,
    ];
  },
});
