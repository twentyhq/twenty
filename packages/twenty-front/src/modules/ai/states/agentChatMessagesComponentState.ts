import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { AgentChatMessage } from '~/generated-metadata/graphql';

export const AgentChatMessagesComponentInstanceContext =
  createComponentInstanceContext();

export const agentChatMessagesComponentState = createComponentStateV2<
  AgentChatMessage[]
>({
  key: 'agentChatMessagesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
