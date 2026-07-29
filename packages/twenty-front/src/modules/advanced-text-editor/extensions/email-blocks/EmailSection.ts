import { mergeAttributes, Node } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

// A full-width block container mapping to a react-email <Section> at send
// time. Styling (background, padding, border...) lives in the inline CSS
// `style` attribute, edited through the block settings side panel.
export const EmailSection = Node.create({
  name: TIPTAP_NODE_TYPES.EMAIL_SECTION,
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      style: {
        default: 'padding: 12px;',
        parseHTML: (element) => element.getAttribute('style'),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-email-section]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-email-section': 'true',
        class: 'email-section',
      }),
      0,
    ];
  },
});
