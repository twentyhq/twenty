import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatLastDiffSyncedThreadState = createAtomState<
  string | null
>({
  key: 'ai/agentChatLastDiffSyncedThreadState',
  defaultValue: null,
});
