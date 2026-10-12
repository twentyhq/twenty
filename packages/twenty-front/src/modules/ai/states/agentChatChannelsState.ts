import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

// The channels open to the member, plus the others for who manages channels,
// in the channels' order. Null until loaded
export const agentChatChannelsState = createAtomState<
  AgentChatChannel[] | null
>({
  key: 'agentChatChannelsState',
  defaultValue: null,
});
