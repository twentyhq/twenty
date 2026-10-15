import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

export const agentChatChannelsState = createAtomState<
  AgentChatChannel[] | null
>({
  key: 'agentChatChannelsState',
  defaultValue: null,
});
