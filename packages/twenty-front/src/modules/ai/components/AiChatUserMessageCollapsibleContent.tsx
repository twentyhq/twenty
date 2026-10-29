import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { type FocusEvent, type ReactNode, useState } from 'react';
import { LightButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AI_CHAT_USER_MESSAGE_COLLAPSED_LINE_COUNT } from '@/ai/constants/AiChatUserMessageCollapsedLineCount';
import { isAiChatUserMessageLong } from '@/ai/utils/isAiChatUserMessageLong';

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

type AiChatUserMessageCollapsibleContentProps = {
  text: string;
  children: ReactNode;
};

export const AiChatUserMessageCollapsibleContent = ({
  text,
  children,
}: AiChatUserMessageCollapsibleContentProps) => {
  const { t } = useLingui();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isAiChatUserMessageLong(text)) {
    return children;
  }

  const handleToggleClick = () => {
    setIsExpanded((previousIsExpanded) => !previousIsExpanded);
  };

  const handleContentFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target.matches(':focus-visible')) {
      setIsExpanded(true);
    }
  };

  return (
    <>
      <StyledContent isCollapsed={!isExpanded} onFocus={handleContentFocus}>
        {children}
      </StyledContent>
      <StyledToggleContainer>
        <LightButton aria-expanded={isExpanded} onClick={handleToggleClick}>
          {isExpanded ? t`Show less` : t`Show more`}
        </LightButton>
      </StyledToggleContainer>
    </>
  );
};
