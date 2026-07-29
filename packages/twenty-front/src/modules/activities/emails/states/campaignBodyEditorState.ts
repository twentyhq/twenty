import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type Editor } from '@tiptap/core';

// The live TipTap editor instance of the campaign body composer, so the
// block settings side panel can read the selection and write attributes
// across the widget/side-panel boundary.
export const campaignBodyEditorState = createAtomState<Editor | null>({
  key: 'campaignBodyEditorState',
  defaultValue: null,
});
