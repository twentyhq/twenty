import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { AgentChatMessage } from '../api/agent-chat.api';

export const AgentChatMessagesComponentInstanceContext =
  createComponentInstanceContext();

export const agentChatMessagesComponentState = createComponentStateV2<
  AgentChatMessage[]
>({
  key: 'agentChatMessagesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
