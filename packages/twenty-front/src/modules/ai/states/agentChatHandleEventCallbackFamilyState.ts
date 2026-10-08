import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';

import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatHandleEventCallbackFamilyState = createAtomFamilyState<
  ((event: AgentChatSubscriptionEvent) => void) | null,
  { threadId: string | null }
>({
  key: 'agentChatHandleEventCallbackFamilyState',
  defaultValue: null,
});
