import { isNonEmptyString } from '@sniptt/guards';
import { type Editor } from '@tiptap/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Only settled text is written to the document. Interim results are shown
// beside the composer instead, because tracking a replaceable range inside
// ProseMirror breaks as soon as the user edits while dictating — and they do,
// since the composer stays focused throughout.
export const useInsertDictatedText = (editor: Editor | null) =>
  useCallback(
    (text: string) => {
      if (!isDefined(editor) || !isNonEmptyString(text)) {
        return;
      }

      const { from } = editor.state.selection;
      // A bare string is parsed as HTML against the editor's schema, so a
      // transcript containing "<b>" loses the tag and gains a mark. A text node
      // writes what was actually said.
      const precedingCharacter = editor.state.doc.textBetween(
        Math.max(from - 1, 0),
        from,
      );
      // Neither engine prefixes a space, and every press is a fresh utterance.
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
