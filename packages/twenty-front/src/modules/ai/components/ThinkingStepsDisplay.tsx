import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconChevronRight, IconCpu } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThinkingRow } from '@/ai/components/AiChatThinkingRow';
import { LazyMarkdownRenderer } from '@/ai/components/LazyMarkdownRenderer';
import { StyledParagraph } from '@/ai/components/LazyMarkdownRendererStyledComponents';
import { ThinkingToolStepRow } from '@/ai/components/ThinkingToolStepRow';
import { getActiveReasoningContent } from '@/ai/utils/getActiveReasoningContent';
import { getLastReasoningContent } from '@/ai/utils/getLastReasoningContent';
import { isThinkingStepPartActive } from '@/ai/utils/isThinkingStepPartActive';
import { type ThinkingStepPart } from '@/ai/types/ThinkingStepPart';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${themeCssVariables.font.family};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledStepsContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledSummaryText = styled.span`
  color: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.md};
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
`;

const StyledSummaryButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 24px;
  padding: 0;
  width: fit-content;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }
`;

const StyledSummaryChevronContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  justify-content: center;
  transform: rotate(${({ isExpanded }) => (isExpanded ? '90deg' : '0deg')});
  transition: transform calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
`;

const StyledRowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 24px;
`;

const StyledRowLabel = styled.span`
  color: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.md};
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
`;

const StyledReasoningContainer = styled.div`
  padding-left: calc(
    ${themeCssVariables.icon.size.sm} * 1px + ${themeCssVariables.spacing[2]}
  );
`;

const StyledReasoningText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.lg};

  // reasoning uses single newlines as line breaks, which markdown would collapse
  ${StyledParagraph} {
    white-space: pre-line;
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  justify-content: center;
  min-width: calc(${themeCssVariables.icon.size.sm} * 1px);
`;

const StyledRowLabelContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const ThinkingStepRow = ({
  isActive,
  part,
}: {
  isActive: boolean;
  part: ThinkingStepPart;
}) => {
  if (part.type !== 'reasoning') {
    return <ThinkingToolStepRow part={part} isActive={isActive} />;
  }

  if (isActive) {
    return <AiChatThinkingRow />;
  }

  return (
    <StyledRow>
      <StyledIconContainer>
        <IconCpu size={14} />
      </StyledIconContainer>
      <StyledRowLabelContainer>
        <StyledRowLabel>{t`Thought`}</StyledRowLabel>
      </StyledRowLabelContainer>
    </StyledRow>
  );
};

export const ThinkingStepsDisplay = ({
  parts,
  isLastMessageStreaming,
  hasAssistantTextResponseStarted,
  isTrailingWhileStreaming = false,
}: {
  parts: ThinkingStepPart[];
  isLastMessageStreaming: boolean;
  hasAssistantTextResponseStarted: boolean;
  isTrailingWhileStreaming?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const stepCount = parts.length;
  const hasActiveStep = parts.some((part) =>
    isThinkingStepPartActive(part, isLastMessageStreaming),
  );

  const activeReasoningContent = getActiveReasoningContent(parts);
  const finalReasoningContent = getLastReasoningContent(parts);
  const reasoningContent = hasActiveStep
    ? activeReasoningContent
    : finalReasoningContent;
  const shouldDisplayReasoningContent = reasoningContent?.trim().length;
  const shouldKeepExpandedBeforeAnswer = !hasAssistantTextResponseStarted;
  const shouldShowSummaryButton =
    !hasActiveStep && !shouldKeepExpandedBeforeAnswer;

  const shouldRenderRows =
    hasActiveStep || isExpanded || shouldKeepExpandedBeforeAnswer;

  return (
    <StyledContainer>
      {shouldShowSummaryButton && (
        <StyledSummaryButton
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((previousValue) => !previousValue)}
        >
          <StyledSummaryChevronContainer isExpanded={isExpanded}>
            <IconChevronRight size={14} />
          </StyledSummaryChevronContainer>
          <StyledSummaryText>
            {plural(stepCount, {
              one: '# step',
              other: '# steps',
            })}
          </StyledSummaryText>
        </StyledSummaryButton>
      )}

      {shouldRenderRows && (
        <StyledStepsContentContainer>
          <StyledRowsContainer>
            {parts.map((part, index) => (
              <ThinkingStepRow
                key={index}
                part={part}
                isActive={isThinkingStepPartActive(
                  part,
                  isLastMessageStreaming,
                )}
              />
            ))}
            {isTrailingWhileStreaming && !hasActiveStep && (
              <AiChatThinkingRow />
            )}
          </StyledRowsContainer>
          {!!shouldDisplayReasoningContent && (
            <StyledReasoningContainer>
              <StyledReasoningText>
                <LazyMarkdownRenderer text={reasoningContent} />
              </StyledReasoningText>
            </StyledReasoningContainer>
          )}
        </StyledStepsContentContainer>
      )}
    </StyledContainer>
  );
};
