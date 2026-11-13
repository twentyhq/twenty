import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';

export const inboxChannelsState = createAtomState<AgentChatChannel[] | null>({
  key: 'inboxChannelsState',
  defaultValue: null,
});
