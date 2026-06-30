import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatSelectedFilesState = createAtomState<File[]>({
  key: 'ai/agentChatSelectedFilesState',
  defaultValue: [],
});
