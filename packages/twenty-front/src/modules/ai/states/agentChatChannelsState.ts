import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';

export const agentChatChannelsState = createAtomState<
  AgentChatChannel[] | null
>({
  key: 'agentChatChannelsState',
  defaultValue: null,
});
