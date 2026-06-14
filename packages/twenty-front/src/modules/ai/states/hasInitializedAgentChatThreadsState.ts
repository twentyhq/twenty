import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasInitializedAgentChatThreadsState = createAtomState<boolean>({
  key: 'hasInitializedAgentChatThreadsState',
  defaultValue: false,
});
