import { agentChatIsScrolledToBottomComponentSelector } from '@/ai/states/selectors/agentChatIsScrolledToBottomComponentSelector';
import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowDown } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledScrollToBottomButton = styled.button<{ isVisible: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.rounded};
  bottom: ${themeCssVariables.spacing[3]};
  box-shadow: ${themeCssVariables.boxShadow.light};
  color: ${themeCssVariables.font.color.secondary};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  left: 50%;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  position: absolute;
  transform: translateX(-50%);
  transition:
    opacity calc(${themeCssVariables.animation.duration.normal} * 1s) ease,
    background calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
  width: 32px;
  z-index: 1;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;

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
    <StyledScrollToBottomButton
      isVisible={!agentChatIsScrolledToBottom}
      onClick={handleClick}
    >
      <IconArrowDown size={16} />
    </StyledScrollToBottomButton>
  );
};
