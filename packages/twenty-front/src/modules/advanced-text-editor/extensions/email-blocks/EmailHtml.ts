import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { EmailHtmlView } from '@/advanced-text-editor/extensions/email-blocks/EmailHtmlView';

export const DEFAULT_EMAIL_HTML =
  '<p style="margin: 0;">Edit this HTML in the block settings panel.</p>';

// A raw HTML snippet embedded verbatim in the email. The canvas shows a
// rendered preview; the source is edited in the block settings panel.
export const EmailHtml = Node.create({
  name: TIPTAP_NODE_TYPES.EMAIL_HTML,
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      html: {
        default: DEFAULT_EMAIL_HTML,
        parseHTML: (element) => element.getAttribute('data-html'),
        renderHTML: (attributes) => ({ 'data-html': attributes.html }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-email-html]' }];
  },

  renderHTML() {
    return ['div', { 'data-email-html': 'true', class: 'email-html' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmailHtmlView);
  },
});
