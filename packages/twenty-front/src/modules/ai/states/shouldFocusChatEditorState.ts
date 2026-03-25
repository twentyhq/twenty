import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldFocusChatEditorState = createAtomState<boolean>({
  key: 'ai/shouldFocusChatEditorState',
  defaultValue: false,
});
