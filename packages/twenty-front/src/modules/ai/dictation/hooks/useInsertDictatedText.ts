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

      editor.chain().focus().insertContent(text).run();
    },
    [editor],
  );
