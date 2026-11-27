import { isNonEmptyString } from '@sniptt/guards';
import { type Editor } from '@tiptap/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useInsertDictatedText = (editor: Editor | null) =>
  useCallback(
    (text: string) => {
      if (!isDefined(editor) || !isNonEmptyString(text)) {
        return;
      }

      const { from } = editor.state.selection;
      const precedingCharacter = editor.state.doc.textBetween(
        Math.max(from - 1, 0),
        from,
      );
      const needsSeparator =
        isNonEmptyString(precedingCharacter) && !/\s/.test(precedingCharacter);

      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: needsSeparator ? ` ${text}` : text,
        })
        .run();
    },
    [editor],
  );
