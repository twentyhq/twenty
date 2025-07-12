import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { AgentChatMessagesComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatMessagesComponentState';
import { AgentChatFile } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/AgentChatFile';

export const agentChatUploadedFilesComponentState = createComponentStateV2<
  AgentChatFile[]
>({
  key: 'agentChatUploadedFilesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
