import { type AgentMessageReactionSummary } from 'twenty-shared/ai';

import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatMessageReactionsFamilyState = createAtomFamilyState<
  AgentMessageReactionSummary[],
  { messageId: string }
>({
  key: 'aiChatMessageReactionsFamilyState',
  defaultValue: [],
});
