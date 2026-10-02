import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadInboxNowState = createAtomState<number>({
  key: 'ai/agentChatThreadInboxNowState',
  defaultValue: Date.now(),
});
