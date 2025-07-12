import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { AgentChatMessagesComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatMessagesComponentState';

export const agentChatSelectedFilesComponentState = createComponentStateV2<
  File[]
>({
  key: 'agentChatSelectedFilesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
