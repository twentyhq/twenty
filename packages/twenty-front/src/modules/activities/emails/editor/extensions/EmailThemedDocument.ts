import { Document } from '@tiptap/extension-document';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import {
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  CANVAS_THEME_DEFAULTS,
} from 'twenty-shared/utils';

export const EmailThemedDocument = Document.extend({
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

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('emailCanvasLightColorScheme'),
        props: {
          attributes: { class: 'light' },
        },
      }),
    ];
  },
});
