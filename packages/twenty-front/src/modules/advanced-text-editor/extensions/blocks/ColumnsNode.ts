import { mergeAttributes, Node } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

// A horizontal row of equal-width columns, mapping to a react-email
// <Row>/<Column> table layout at send time.
export const ColumnsNode = Node.create({
  name: TIPTAP_NODE_TYPES.COLUMNS,
  group: 'block',
  content: `${TIPTAP_NODE_TYPES.COLUMN}{2,4}`,
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
    return [{ tag: 'div[data-block-columns]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-columns': 'true',
        class: 'block-columns',
      }),
      0,
    ];
  },
});
