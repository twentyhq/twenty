import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type AgentMessage } from '~/generated-metadata/graphql';

export const AgentChatMessagesComponentInstanceContext =
  createComponentInstanceContext();

export const agentChatMessagesComponentState = createAtomComponentState<
  AgentMessage[]
>({
  key: 'agentChatMessagesComponentState',
  defaultValue: [],
  componentInstanceContext: AgentChatMessagesComponentInstanceContext,
});
