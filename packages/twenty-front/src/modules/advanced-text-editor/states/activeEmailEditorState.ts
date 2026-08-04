import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type Editor } from '@tiptap/core';

// The email block settings panel follows whichever structured email editor is
// active. Campaigns own the first integration; workflow email can register the
// same way without another surface-specific side-panel state.
export const activeEmailEditorState = createAtomState<Editor | null>({
  key: 'activeEmailEditorState',
  defaultValue: null,
});
