import { AI_CHAT_SCROLL_BOTTOM_THRESHOLD_IN_PX } from '@/ai/constants/AiChatScrollBottomThresholdInPx';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const agentChatIsScrolledToBottomComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'agentChatIsScrolledToBottomComponentSelector',
    componentInstanceContext: ScrollWrapperComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const scrollBottom = get(scrollWrapperScrollBottomComponentState, {
          instanceId,
        });

        return scrollBottom <= AI_CHAT_SCROLL_BOTTOM_THRESHOLD_IN_PX;
      },
  });
