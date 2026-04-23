import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatLastDiffSyncedThreadState = createAtomState<string>({
  key: 'ai/agentChatLastDiffSyncedThreadState',
  defaultValue: '',
});
