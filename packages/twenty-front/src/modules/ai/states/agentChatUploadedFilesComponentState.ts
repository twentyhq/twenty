import { AgentChatMessagesComponentInstanceContext } from '@/ai/states/agentChatMessagesComponentState';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { File } from '~/generated-metadata/graphql';

export const agentChatUploadedFilesComponentState = createComponentState<
  File[]
>({
  key: 'agentChatUploadedFilesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
