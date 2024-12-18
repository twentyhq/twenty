import { isNonEmptyString } from '@sniptt/guards';
import { Editor } from '@tiptap/react';

export const CAPTURE_VARIABLE_TAG_REGEX = /({{[^{}]+}})/;

export const initializeEditorContent = (editor: Editor, content: string) => {
  const lines = content.split(/\n/);

  lines.forEach((line, index) => {
    const parts = line.split(CAPTURE_VARIABLE_TAG_REGEX);
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

    // Add hard break if it's not the last line
    if (index < lines.length - 1) {
      editor.commands.insertContent({
        type: 'hardBreak',
      });
    }
  });
};
