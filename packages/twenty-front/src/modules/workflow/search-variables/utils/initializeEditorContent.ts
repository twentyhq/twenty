import { isNonEmptyString } from '@sniptt/guards';
import { Editor } from '@tiptap/react';

const REGEX_VARIABLE_TAG = /(\{\{[^}]+\}\})/;

export const initializeEditorContent = (editor: Editor, content: string) => {
  const parts = content.split(REGEX_VARIABLE_TAG);

  parts.forEach((part) => {
    if (part.length === 0) {
      return;
    }

    if (part.startsWith('{{') && part.endsWith('}}')) {
      editor.commands.insertContent({
        type: 'variableTag',
        attrs: { variable: part },
      });
      return;
    }

    if (isNonEmptyString(part)) {
      editor.commands.insertContent(part);
    }
  });
};
