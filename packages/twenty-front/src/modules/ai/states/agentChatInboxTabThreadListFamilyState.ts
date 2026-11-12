import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { type AgentChatThreadPagedList } from '@/ai/types/AgentChatThreadPagedList';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatInboxTabThreadListFamilyState = createAtomFamilyState<
  AgentChatThreadPagedList | null,
  AgentChatThreadFilterStatus
>({
  key: 'agentChatInboxTabThreadListFamilyState',
  defaultValue: null,
});
