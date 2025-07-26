import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { AgentChatMessagesComponentInstanceContext } from '@/ai/states/agentChatMessagesComponentState';
import { File } from '~/generated-metadata/graphql';

export const agentChatUploadedFilesComponentState = createComponentStateV2<
  File[]
>({
  key: 'agentChatUploadedFilesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
