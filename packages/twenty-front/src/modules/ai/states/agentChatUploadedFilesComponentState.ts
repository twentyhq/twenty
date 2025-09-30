import { AgentChatMessagesComponentInstanceContext } from '@/ai/states/agentChatMessagesComponentState';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type FileUIPart } from 'ai';

export const agentChatUploadedFilesComponentState = createComponentState<
  FileUIPart[]
>({
  key: 'agentChatUploadedFilesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
