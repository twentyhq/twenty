import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import {
  type PointerEvent,
  type ReactNode,
  useCallback,
  useState,
} from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AI_CHAT_USER_MESSAGE_COLLAPSED_LINE_COUNT } from '@/ai/constants/AiChatUserMessageCollapsedLineCount';

const StyledContent = styled.div<{ isCollapsed: boolean }>`
  mask-image: ${({ isCollapsed }) =>
    isCollapsed
      ? 'linear-gradient(to bottom, black calc(100% - 2lh), transparent)'
      : 'none'};
  max-height: ${({ isCollapsed }) =>
    isCollapsed ? `${AI_CHAT_USER_MESSAGE_COLLAPSED_LINE_COUNT}lh` : 'none'};
  overflow: hidden;
`;

const StyledToggleContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-inline: calc(-1 * ${themeCssVariables.spacing[1]});
  padding-bottom: ${themeCssVariables.spacing[1]};
`;

const isTallerThanCollapsedHeight = (element: HTMLElement) =>
  element.scrollHeight >
  parseFloat(getComputedStyle(element).lineHeight) *
    AI_CHAT_USER_MESSAGE_COLLAPSED_LINE_COUNT;

type AiChatUserMessageCollapsibleContentProps = {
  children: ReactNode;
};

export const AiChatUserMessageCollapsibleContent = ({
  children,
}: AiChatUserMessageCollapsibleContentProps) => {
  const { t } = useLingui();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const contentRef = useCallback((contentElement: HTMLDivElement | null) => {
    if (isDefined(contentElement)) {
      setIsOverflowing(isTallerThanCollapsedHeight(contentElement));
    }
  }, []);

  // Re-measured on hover so a chat resized after mount still gets the right toggle.
  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    setIsOverflowing(isTallerThanCollapsedHeight(event.currentTarget));
  };

  const handleToggleClick = () => {
    setIsExpanded((previousIsExpanded) => !previousIsExpanded);
  };

  return (
    <>
      <StyledContent
        ref={contentRef}
        isCollapsed={isOverflowing && !isExpanded}
        onPointerEnter={handlePointerEnter}
      >
        {children}
      </StyledContent>
      {isOverflowing && (
        <StyledToggleContainer>
          <LightButton aria-expanded={isExpanded} onClick={handleToggleClick}>
            {isExpanded ? t`Show less` : t`Show more`}
          </LightButton>
        </StyledToggleContainer>
      )}
    </>
  );
};
