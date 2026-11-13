import { INBOX_SCROLL_BOTTOM_THRESHOLD_IN_PX } from '@/ai/constants/InboxScrollBottomThresholdInPx';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const inboxIsScrolledToBottomComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'inboxIsScrolledToBottomComponentSelector',
    componentInstanceContext: ScrollWrapperComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const scrollBottom = get(scrollWrapperScrollBottomComponentState, {
          instanceId,
        });

        return scrollBottom <= INBOX_SCROLL_BOTTOM_THRESHOLD_IN_PX;
      },
  });
