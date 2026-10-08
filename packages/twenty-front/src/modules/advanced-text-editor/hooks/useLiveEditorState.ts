import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

// useEditorState's snapshot can hold an editor `useEditor` already destroyed; select from the caller's instance.
// TODO: drop this hook once https://github.com/ueberdosis/tiptap/issues/7346 ships.
export const useLiveEditorState = <TSelectorResult>(
  editor: Editor,
  select: (editor: Editor) => TSelectorResult,
): TSelectorResult =>
  useEditorState({
    editor,
    selector: () => select(editor),
  });
