/* oxlint-disable twenty/no-hardcoded-colors --
   default styles are literal inline CSS shipped inside emails, where theme
   variables do not exist */
import { mergeAttributes, Node } from '@tiptap/core';
import { readBlockStyleAttribute } from '@/advanced-text-editor/extensions/blocks/readBlockStyleAttribute';
import { inlineStyleToCss } from '@/advanced-text-editor/utils/inlineStyleToCss';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const DividerNode = Node.create({
  name: TIPTAP_NODE_TYPES.DIVIDER,
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      style: {
        default: {
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          borderTopColor: '#e1e1e1',
          marginTop: '16px',
          marginRight: '0px',
          marginBottom: '16px',
          marginLeft: '0px',
        },
        parseHTML: readBlockStyleAttribute,
        renderHTML: (attributes) => ({
          style: inlineStyleToCss(attributes.style),
          'data-style': JSON.stringify(attributes.style ?? {}),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'hr[data-block-divider]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'hr',
      mergeAttributes(HTMLAttributes, {
        'data-block-divider': 'true',
        class: 'block-divider',
      }),
    ];
  },
});
