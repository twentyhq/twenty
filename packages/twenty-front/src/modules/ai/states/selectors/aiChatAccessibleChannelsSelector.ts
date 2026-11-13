import { aiChatChannelsState } from '@/ai/states/aiChatChannelsState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type AiChatChannel } from '@/ai/types/AiChatChannel';

export const aiChatAccessibleChannelsSelector = createAtomSelector<
  AiChatChannel[]
>({
  key: 'aiChatAccessibleChannelsSelector',
  get: ({ get }) =>
    (get(aiChatChannelsState) ?? []).filter(({ isAccessible }) => isAccessible),
});
