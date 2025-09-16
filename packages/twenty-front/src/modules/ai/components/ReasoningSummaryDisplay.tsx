import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';

import { IconBrain, IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { t } from '@lingui/core/macro';

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

const StyledToggleButton = styled.div`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
  transition: color ${({ theme }) => theme.animation.duration.normal}s;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const ReasoningSummaryDisplay = ({
  content,
  isThinking = false,
}: {
  content: string;
  isThinking?: boolean;
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContent = content.trim().length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <StyledContainer>
      {isThinking && (
        <>
          <ShimmeringText>
            <StyledIconContainer>
              <IconBrain size={theme.icon.size.sm} />
              <StyledThinkingText>{t`Thinking...`}</StyledThinkingText>
            </StyledIconContainer>
          </ShimmeringText>
          <StyledReasoningContainer>
            <StyledReasoningText>{content}</StyledReasoningText>
          </StyledReasoningContainer>
        </>
      )}

      {hasContent && !isThinking && (
        <>
          <StyledToggleButton onClick={() => setIsExpanded(!isExpanded)}>
            <StyledIconContainer>
              <IconBrain size={theme.icon.size.sm} />
              <span>{t`Finished thinking`}</span>
            </StyledIconContainer>
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
