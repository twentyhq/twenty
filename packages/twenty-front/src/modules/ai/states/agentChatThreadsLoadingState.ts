import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadsLoadingState = createAtomState({
  key: 'agentChatThreadsLoadingState',
  defaultValue: false,
});
