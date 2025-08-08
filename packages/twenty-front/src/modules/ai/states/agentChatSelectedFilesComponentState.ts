import { AgentChatMessagesComponentInstanceContext } from '@/ai/states/agentChatMessagesComponentState';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const agentChatSelectedFilesComponentState = createComponentState<
  File[]
>({
  key: 'agentChatSelectedFilesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
