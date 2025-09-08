import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';

import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledThinkingContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledThinkingText = styled.div`
  animation: shimmer 1.5s ease-in-out infinite;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  @keyframes shimmer {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }
`;

const StyledReasoningSummaryContainer = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledReasoningSummaryText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  white-space: pre-wrap;
`;

const StyledToggleButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
  transition: color ${({ theme }) => theme.animation.duration.normal}s;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

type ReasoningSummaryDisplayProps = {
  reasoningSummary: string;
  isStreaming?: boolean;
  isCompleted?: boolean;
  isReasoningStreaming?: boolean;
};

export const ReasoningSummaryDisplay = ({
  reasoningSummary,
  isStreaming = false,
  isCompleted = false,
  isReasoningStreaming = false,
}: ReasoningSummaryDisplayProps) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasReasoningSummary = reasoningSummary.trim().length > 0;
  const shouldShowThinking = isReasoningStreaming && hasReasoningSummary;
  const shouldShowReasoningSummary =
    isReasoningStreaming && hasReasoningSummary;
  const shouldShowToggleButton =
    (isCompleted || isStreaming) &&
    hasReasoningSummary &&
    !isReasoningStreaming;

  if (
    !shouldShowThinking &&
    !shouldShowReasoningSummary &&
    !shouldShowToggleButton
  ) {
    return null;
  }

  return (
    <StyledContainer>
      {shouldShowThinking && (
        <StyledThinkingContainer>
          <StyledThinkingText>Thinking...</StyledThinkingText>
        </StyledThinkingContainer>
      )}

      {shouldShowReasoningSummary && (
        <StyledReasoningSummaryContainer>
          <StyledReasoningSummaryText>
            {reasoningSummary}
          </StyledReasoningSummaryText>
        </StyledReasoningSummaryContainer>
      )}

      {shouldShowToggleButton && (
        <>
          <StyledToggleButton onClick={() => setIsExpanded(!isExpanded)}>
            <span>Finished thinking</span>
            {isExpanded ? (
              <IconChevronUp size={theme.icon.size.sm} />
            ) : (
              <IconChevronDown size={theme.icon.size.sm} />
            )}
          </StyledToggleButton>

          <AnimatedExpandableContainer isExpanded={isExpanded}>
            <StyledReasoningSummaryContainer>
              <StyledReasoningSummaryText>
                {reasoningSummary}
              </StyledReasoningSummaryText>
            </StyledReasoningSummaryContainer>
          </AnimatedExpandableContainer>
        </>
      )}
    </StyledContainer>
  );
};
