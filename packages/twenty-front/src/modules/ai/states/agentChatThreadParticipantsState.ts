import { type AgentChatThreadParticipantState } from 'twenty-shared/types';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadParticipantsState = createAtomState<
  Record<string, AgentChatThreadParticipantState>
>({
  key: 'ai/agentChatThreadParticipantsState',
  defaultValue: {},
});
