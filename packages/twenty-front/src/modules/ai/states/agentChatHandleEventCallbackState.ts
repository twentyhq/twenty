import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatHandleEventCallbackState = createAtomState<
  ((event: AgentChatSubscriptionEvent) => void) | null
>({
  key: 'agentChatHandleEventCallbackState',
  defaultValue: null,
});
