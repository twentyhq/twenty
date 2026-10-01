import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatThreadParticipantSync = {
  version: number;
  pendingRequestCount: number;
};

// Per thread, so a late response or a refresh never overwrites a newer local
// change to the member's state
export const agentChatThreadParticipantSyncState = createAtomState<
  Record<string, AgentChatThreadParticipantSync>
>({
  key: 'ai/agentChatThreadParticipantSyncState',
  defaultValue: {},
});
