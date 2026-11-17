import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatStreamRecoveryAttemptsState = createAtomState<number>({
  key: 'aiChatStreamRecoveryAttemptsState',
  defaultValue: 0,
});
