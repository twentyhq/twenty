import { aiChatChannelsState } from '@/ai-chat/states/aiChatChannelsState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type AiChatChannel } from '@/ai-chat/types/AiChatChannel';

export const aiChatAccessibleChannelsSelector = createAtomSelector<
  AiChatChannel[]
>({
  key: 'aiChatAccessibleChannelsSelector',
  get: ({ get }) =>
    (get(aiChatChannelsState) ?? []).filter(({ isAccessible }) => isAccessible),
});
