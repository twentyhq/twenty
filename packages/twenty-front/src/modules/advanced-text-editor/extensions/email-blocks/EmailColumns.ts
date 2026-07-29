import { mergeAttributes, Node } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

// A horizontal row of equal-width columns, mapping to a react-email
// <Row>/<Column> table layout at send time.
export const EmailColumns = Node.create({
  name: TIPTAP_NODE_TYPES.EMAIL_COLUMNS,
  group: 'block',
  content: `${TIPTAP_NODE_TYPES.EMAIL_COLUMN}{2,4}`,
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
    return [{ tag: 'div[data-email-columns]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-email-columns': 'true',
        class: 'email-columns',
      }),
      0,
    ];
  },
});
