import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

const SCROLL_BOTTOM_THRESHOLD_PX = 100;

export const agentChatIsScrolledToBottomSelector = createAtomSelector<boolean>({
  key: 'agentChatIsScrolledToBottomSelector',
  get: ({ get }) => {
    const scrollBottom = get(scrollWrapperScrollBottomComponentState, {
      instanceId: AI_CHAT_SCROLL_WRAPPER_ID,
    });

    return scrollBottom <= SCROLL_BOTTOM_THRESHOLD_PX;
  },
});
