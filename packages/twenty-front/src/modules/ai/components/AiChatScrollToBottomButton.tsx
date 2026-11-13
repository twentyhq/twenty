import { inboxIsScrolledToBottomComponentSelector } from '@/ai/states/selectors/agentChatIsScrolledToBottomComponentSelector';
import { scrollInboxToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { ScrollOverlayButton } from '@/ui/utilities/scroll/components/ScrollOverlayButton';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowDown } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

export const InboxScrollToBottomButton = () => {
  const { t } = useLingui();
  const inboxIsScrolledToBottom = useAtomComponentSelectorValue(
    inboxIsScrolledToBottomComponentSelector,
  );

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const handleClick = () => {
    const { scrollWrapperElement } = getScrollWrapperElement();

    if (isDefined(scrollWrapperElement)) {
      scrollInboxToBottom(scrollWrapperElement);
    }
  };

  return (
    <ScrollOverlayButton
      Icon={IconArrowDown}
      ariaLabel={t`Scroll to bottom`}
      isVisible={!inboxIsScrolledToBottom}
      onClick={handleClick}
    />
  );
};
