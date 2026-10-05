import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type Editor } from '@tiptap/core';

export const activeEmailEditorState = createAtomState<Editor | null>({
  key: 'activeEmailEditorState',
  defaultValue: null,
});
