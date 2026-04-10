import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';

import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const agentChatHandleEventCallbackComponentState =
  createAtomComponentState<
    ((event: AgentChatSubscriptionEvent) => void) | null
  >({
    key: 'agentChatHandleEventCallbackComponentState',
    defaultValue: null,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
