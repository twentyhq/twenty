import { agentChatIsScrolledToBottomComponentSelector } from '@/ai/states/selectors/agentChatIsScrolledToBottomComponentSelector';
import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { ScrollOverlayButton } from '@/ui/utilities/scroll/components/ScrollOverlayButton';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowDown } from 'twenty-ui/icon';

export const AiChatScrollToBottomButton = () => {
  const agentChatIsScrolledToBottom = useAtomComponentSelectorValue(
    agentChatIsScrolledToBottomComponentSelector,
  );

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const handleClick = () => {
    const { scrollWrapperElement } = getScrollWrapperElement();

    if (isDefined(scrollWrapperElement)) {
      scrollAiChatToBottom(scrollWrapperElement);
    }
  };

  return (
    <ScrollOverlayButton
      Icon={IconArrowDown}
      ariaLabel={t`Scroll to bottom`}
      isVisible={!agentChatIsScrolledToBottom}
      onClick={handleClick}
    />
  );
};
