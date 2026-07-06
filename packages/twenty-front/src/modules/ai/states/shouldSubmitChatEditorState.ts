import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shouldSubmitChatEditorState = createAtomState<boolean>({
  key: 'ai/shouldSubmitChatEditorState',
  defaultValue: false,
});
