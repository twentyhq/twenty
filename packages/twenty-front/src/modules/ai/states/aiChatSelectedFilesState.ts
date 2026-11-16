import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatSelectedFilesState = createAtomState<File[]>({
  key: 'ai/aiChatSelectedFilesState',
  defaultValue: [],
});
