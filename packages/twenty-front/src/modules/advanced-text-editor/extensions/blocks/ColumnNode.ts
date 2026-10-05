import { mergeAttributes, Node } from '@tiptap/core';
import { readBlockStyleAttribute } from '@/advanced-text-editor/extensions/blocks/readBlockStyleAttribute';
import { inlineStyleToCss } from '@/advanced-text-editor/utils/inlineStyleToCss';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const ColumnNode = Node.create({
  name: TIPTAP_NODE_TYPES.COLUMN,
  content: 'block+',
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
