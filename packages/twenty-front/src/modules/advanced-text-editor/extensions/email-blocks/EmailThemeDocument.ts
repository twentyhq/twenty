import { Document } from '@tiptap/extension-document';
import { EMAIL_THEME_DEFAULTS } from 'twenty-shared/utils';

// Campaign documents carry their page-level styling (page background, body
// width, padding...) as a doc attribute, so it persists inside bodyTemplate
// and reaches the server-side email renderer.
export const EmailThemeDocument = Document.extend({
  addAttributes() {
    return {
      emailTheme: {
        default: EMAIL_THEME_DEFAULTS,
      },
    };
  },
});
