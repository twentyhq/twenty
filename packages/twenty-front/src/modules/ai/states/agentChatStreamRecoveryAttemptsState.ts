import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatStreamRecoveryAttemptsState = createAtomState<number>({
  key: 'agentChatStreamRecoveryAttemptsState',
  defaultValue: 0,
});
