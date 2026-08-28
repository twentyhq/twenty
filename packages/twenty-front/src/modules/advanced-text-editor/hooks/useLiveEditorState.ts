import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

// `useEditorState` caches its snapshot until the next transaction: a selector
// reading the snapshot editor still gets the previous instance after
// `useEditor` recreated the editor on a dependency change, and that instance is
// destroyed, so it has dropped its extension and command managers. Selecting
// from the instance the caller holds keeps the selection on the live editor.
// Drop this hook once https://github.com/ueberdosis/tiptap/issues/7346 ships.
export const useLiveEditorState = <TSelectorResult>(
  editor: Editor,
  select: (editor: Editor) => TSelectorResult,
): TSelectorResult =>
  useEditorState({
    editor,
    selector: () => select(editor),
  });
