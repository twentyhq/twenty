import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatSelectedFilesStateV2 = createAtomState<File[]>({
  key: 'ai/agentChatSelectedFilesStateV2',
  defaultValue: [],
});
