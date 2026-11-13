import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AiChatChannel } from '@/ai/types/AiChatChannel';

export const aiChatChannelsState = createAtomState<AiChatChannel[] | null>({
  key: 'aiChatChannelsState',
  defaultValue: null,
});
