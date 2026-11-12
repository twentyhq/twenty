import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatInboxTabRefreshCountFamilyState = createAtomFamilyState<
  number,
  AgentChatThreadFilterStatus
>({
  key: 'agentChatInboxTabRefreshCountFamilyState',
  defaultValue: 0,
});
