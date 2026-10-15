import { type AgentMessageReactionSummary } from 'twenty-shared/ai';

import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Kept apart from the messages, which a stream or a refetch replaces wholesale
export const agentChatMessageReactionsFamilyState = createAtomFamilyState<
  AgentMessageReactionSummary[],
  { messageId: string }
>({
  key: 'agentChatMessageReactionsFamilyState',
  defaultValue: [],
});
