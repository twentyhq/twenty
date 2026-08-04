/* oxlint-disable twenty/no-hardcoded-colors --
   default styles are literal inline CSS shipped inside emails, where theme
   variables do not exist */
import { mergeAttributes, Node } from '@tiptap/core';
import { readBlockStyleAttribute } from '@/advanced-text-editor/extensions/blocks/readBlockStyleAttribute';
import { inlineStyleToCss } from '@/advanced-text-editor/utils/inlineStyleToCss';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

const DEFAULT_BUTTON_STYLE: Record<string, string> = {
  backgroundColor: '#1961ed',
  color: '#ffffff',
  paddingTop: '10px',
  paddingRight: '20px',
  paddingBottom: '10px',
  paddingLeft: '20px',
  borderTopLeftRadius: '6px',
  borderTopRightRadius: '6px',
  borderBottomRightRadius: '6px',
  borderBottomLeftRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
};

export const ButtonNode = Node.create({
  name: TIPTAP_NODE_TYPES.BUTTON,
  group: 'block',
  content: 'text*',
  marks: '',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      href: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-href'),
        renderHTML: (attributes) => ({ 'data-href': attributes.href }),
      },
      align: {
        default: 'left',
        parseHTML: (element) =>
          element.parentElement?.style.textAlign || 'left',
        renderHTML: () => ({}),
      },
      style: {
        default: DEFAULT_BUTTON_STYLE,
        parseHTML: readBlockStyleAttribute,
        renderHTML: (attributes) => ({
          style: inlineStyleToCss(attributes.style),
          'data-style': JSON.stringify(attributes.style ?? {}),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-button-block]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      {
        class: 'block-button-wrapper',
        style: `text-align: ${node.attrs.align ?? 'left'};`,
      },
      [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-button-block': 'true',
          class: 'block-button',
        }),
        0,
      ],
    ];
  },
});
