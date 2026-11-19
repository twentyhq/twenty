import { isNonEmptyString } from '@sniptt/guards';
import { type Editor } from '@tiptap/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Interim results stay outside the document: a replaceable range breaks when the user edits while dictating.
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
      // Neither engine prefixes a space, and every press is a fresh utterance.
      const needsSeparator =
        isNonEmptyString(precedingCharacter) && !/\s/.test(precedingCharacter);

      // A text node, not a string: a string parses as HTML, so "<b>" would become a mark.
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
