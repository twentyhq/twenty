import { mergeAttributes, Node } from '@tiptap/core';
import { readBlockStyleAttribute } from '@/advanced-text-editor/extensions/blocks/readBlockStyleAttribute';
import { inlineStyleToCss } from '@/advanced-text-editor/utils/inlineStyleToCss';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const ColumnsNode = Node.create({
  name: TIPTAP_NODE_TYPES.COLUMNS,
  group: 'block',
  content: `${TIPTAP_NODE_TYPES.COLUMN}{2,4}`,
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      style: {
        default: {},
        parseHTML: readBlockStyleAttribute,
        renderHTML: (attributes) => ({
          style: inlineStyleToCss(attributes.style),
          'data-style': JSON.stringify(attributes.style ?? {}),
        }),
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
