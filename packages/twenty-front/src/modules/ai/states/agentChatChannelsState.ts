import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AgentChatChannelListItem } from '~/generated-metadata/graphql';

// The channels the member can read, joined ones first in their sidebar
// order. Null until loaded
export const agentChatChannelsState = createAtomState<
  AgentChatChannelListItem[] | null
>({
  key: 'agentChatChannelsState',
  defaultValue: null,
});
