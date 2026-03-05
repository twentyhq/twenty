import { styled } from '@linaria/react';
import { useContext, useState } from 'react';

import { IconBrain, IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { t } from '@lingui/core/macro';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledThinkingText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledReasoningContainer = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledReasoningText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  white-space: pre-wrap;
`;

const StyledToggleButton = styled.div`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} 0;
  transition: color calc(${themeCssVariables.animation.duration.normal} * 1s);

  &:hover {
    color: ${themeCssVariables.font.color.secondary};
  }
`;

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
`;

export const ReasoningSummaryDisplay = ({
  content,
  isThinking = false,
}: {
  content: string;
  isThinking?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
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
