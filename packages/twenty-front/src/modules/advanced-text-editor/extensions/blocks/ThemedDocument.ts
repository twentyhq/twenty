import { Document } from '@tiptap/extension-document';
import {
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  CANVAS_THEME_DEFAULTS,
} from 'twenty-shared/utils';

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
