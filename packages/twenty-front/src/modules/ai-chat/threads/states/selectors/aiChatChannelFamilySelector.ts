import { aiChatChannelsState } from '@/ai-chat/threads/states/aiChatChannelsState';
import { type AiChatChannel } from '@/ai-chat/threads/types/AiChatChannel';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const aiChatChannelFamilySelector = createAtomFamilySelector<
  AiChatChannel | undefined,
  string | null | undefined
>({
  key: 'aiChatChannelFamilySelector',
  get:
    (channelId) =>
    ({ get }) =>
      get(aiChatChannelsState)?.find(({ id }) => id === channelId),
});
