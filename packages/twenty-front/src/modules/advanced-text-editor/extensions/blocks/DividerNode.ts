/* oxlint-disable twenty/no-hardcoded-colors --
   default styles are literal inline CSS shipped inside emails, where theme
   variables do not exist */
import { mergeAttributes, Node } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const DividerNode = Node.create({
  name: TIPTAP_NODE_TYPES.DIVIDER,
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      style: {
        // Longhands rather than the border-top shorthand, so the settings
        // panel can edit width and color independently.
        default:
          'border-top-width: 1px; border-top-style: solid; border-top-color: #e1e1e1; margin: 16px 0;',
        parseHTML: (element) => element.getAttribute('style'),
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
