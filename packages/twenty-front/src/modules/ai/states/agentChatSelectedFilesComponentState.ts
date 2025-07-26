import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { AgentChatMessagesComponentInstanceContext } from '@/ai/states/agentChatMessagesComponentState';

export const agentChatSelectedFilesComponentState = createComponentStateV2<
  File[]
>({
  key: 'agentChatSelectedFilesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
