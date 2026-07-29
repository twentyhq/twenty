/* oxlint-disable twenty/no-hardcoded-colors --
   default styles are literal inline CSS shipped inside emails, where theme
   variables do not exist */
import { mergeAttributes, Node } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const DEFAULT_EMAIL_BUTTON_STYLE =
  'background-color: #1961ed; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;';

// A call-to-action button mapping to a react-email <Button> (a styled <a>)
// at send time. The label is editable inline; href and styles are edited in
// the block settings side panel.
export const EmailButton = Node.create({
  name: TIPTAP_NODE_TYPES.EMAIL_BUTTON,
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
      style: {
        default: DEFAULT_EMAIL_BUTTON_STYLE,
        parseHTML: (element) => element.getAttribute('style'),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-email-button]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'email-button-wrapper' },
      [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-email-button': 'true',
          class: 'email-button',
        }),
        0,
      ],
    ];
  },
});
