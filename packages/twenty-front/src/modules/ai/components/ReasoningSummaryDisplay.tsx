import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';

import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { Shimmer } from '@/ai/components/ShimmerEffect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledThinkingText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledReasoningContainer = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledReasoningText = styled.div`
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
  content: string;
  isThinking?: boolean;
};

export const ReasoningSummaryDisplay = ({
  content,
  isThinking = false,
}: ReasoningSummaryDisplayProps) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContent = content.trim().length > 0;
  const isFinished = hasContent && !isThinking;

  if (!hasContent) {
    return null;
  }

  return (
    <StyledContainer>
      {isThinking && (
        <Shimmer>
          <StyledThinkingText>Thinking...</StyledThinkingText>
        </Shimmer>
      )}

      {isThinking && (
        <StyledReasoningContainer>
          <StyledReasoningText>{content}</StyledReasoningText>
        </StyledReasoningContainer>
      )}

      {isFinished && (
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
            <StyledReasoningContainer>
              <StyledReasoningText>{content}</StyledReasoningText>
            </StyledReasoningContainer>
          </AnimatedExpandableContainer>
        </>
      )}
    </StyledContainer>
  );
};
