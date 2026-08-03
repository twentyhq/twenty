import { Document } from '@tiptap/extension-document';
import {
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  CANVAS_THEME_DEFAULTS,
} from 'twenty-shared/utils';

// Campaign documents carry their page-level styling (page background, body
// width, padding...) as a doc attribute, so it persists inside bodyTemplate
// and reaches the server-side email renderer. schemaVersion stamps every
// saved document with the email document contract it was authored against,
// so future format changes can migrate instead of guessing.
export const ThemedDocument = Document.extend({
  addAttributes() {
    return {
      canvasTheme: {
        default: CANVAS_THEME_DEFAULTS,
      },
      schemaVersion: {
        default: EMAIL_DOCUMENT_SCHEMA_VERSION,
      },
    };
  },
});
