import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { type ReactNode, useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AI_CHAT_USER_MESSAGE_COLLAPSED_LINE_COUNT } from '@/ai/constants/AiChatUserMessageCollapsedLineCount';

const StyledClampedContent = styled.div<{
  isCollapsed: boolean;
  hasFade: boolean;
}>`
  mask-image: ${({ hasFade }) =>
    hasFade
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
    if (!isDefined(contentElement)) {
      return;
    }

    const updateIsOverflowing = () => {
      const collapsedMaxHeight =
        parseFloat(getComputedStyle(contentElement).lineHeight) *
        AI_CHAT_USER_MESSAGE_COLLAPSED_LINE_COUNT;

      setIsOverflowing(contentElement.offsetHeight > collapsedMaxHeight);
    };

    updateIsOverflowing();

    const resizeObserver = new ResizeObserver(updateIsOverflowing);

    resizeObserver.observe(contentElement);

    return () => resizeObserver.disconnect();
  }, []);

  const handleToggleClick = () => {
    setIsExpanded((previousIsExpanded) => !previousIsExpanded);
  };

  return (
    <>
      <StyledClampedContent
        isCollapsed={!isExpanded}
        hasFade={!isExpanded && isOverflowing}
      >
        <div ref={contentRef}>{children}</div>
      </StyledClampedContent>
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
