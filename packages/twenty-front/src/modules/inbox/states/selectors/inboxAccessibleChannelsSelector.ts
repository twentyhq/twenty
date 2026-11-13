import { inboxChannelsState } from '@/inbox/states/inboxChannelsState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';

export const inboxAccessibleChannelsSelector = createAtomSelector<
  AgentChatChannel[]
>({
  key: 'inboxAccessibleChannelsSelector',
  get: ({ get }) =>
    (get(inboxChannelsState) ?? []).filter(({ isAccessible }) => isAccessible),
});
