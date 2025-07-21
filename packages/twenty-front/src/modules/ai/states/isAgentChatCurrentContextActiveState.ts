import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { AgentChatMessagesComponentInstanceContext } from '@/ai/states/agentChatMessagesComponentState';

export const isAgentChatCurrentContextActiveState =
  createComponentStateV2<boolean>({
    defaultValue: false,
    key: 'isAgentChatCurrentContextActiveState',
    componentInstanceContext: AgentChatMessagesComponentInstanceContext,
  });
