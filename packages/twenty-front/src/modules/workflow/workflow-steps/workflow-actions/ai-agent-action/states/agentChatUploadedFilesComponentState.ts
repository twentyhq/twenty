import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { AgentChatMessagesComponentInstanceContext } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatMessagesComponentState';

export type AgentChatFile = {
  id: string;
  name: string;
  fullPath: string;
  size: number;
  type: string;
  createdAt: string;
};

export const agentChatUploadedFilesComponentState = createComponentStateV2<
  AgentChatFile[]
>({
  key: 'agentChatUploadedFilesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
