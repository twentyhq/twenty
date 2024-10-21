import { Editor } from '@tiptap/react';
import { isDefined } from 'twenty-ui';

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

    if (isDefined(part.trim())) {
      editor.commands.insertContent(part);
    }
  });
};
