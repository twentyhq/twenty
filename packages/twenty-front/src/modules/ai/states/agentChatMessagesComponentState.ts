import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type AgentChatMessage } from '~/generated-metadata/graphql';

export const AgentChatMessagesComponentInstanceContext =
  createComponentInstanceContext();

export const agentChatMessagesComponentState = createComponentState<
  AgentChatMessage[]
>({
  key: 'agentChatMessagesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
