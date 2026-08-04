import { mergeAttributes, Node } from '@tiptap/core';
import { readBlockStyleAttribute } from '@/advanced-text-editor/extensions/blocks/readBlockStyleAttribute';
import { inlineStyleToCss } from '@/advanced-text-editor/utils/inlineStyleToCss';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const SectionNode = Node.create({
  name: TIPTAP_NODE_TYPES.SECTION,
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      style: {
        default: {
          paddingTop: '12px',
          paddingRight: '12px',
          paddingBottom: '12px',
          paddingLeft: '12px',
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
    return [{ tag: 'div[data-block-section]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-block-section': 'true',
        class: 'block-section',
      }),
      0,
    ];
  },
});
