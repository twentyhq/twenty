import styled from '@emotion/styled';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconChevronDown, IconChevronRight, IconCpu } from 'twenty-ui/display';

import { ThinkingOrbitLoaderIcon } from '@/ai/components/ThinkingOrbitLoaderIcon';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import {
  getToolDisplayMessage,
  resolveToolInput,
} from '@/ai/utils/getToolDisplayMessage';
import {
  getActiveReasoningContent,
  getLastReasoningContent,
  isThinkingStepPartActive,
  type ThinkingStepPart,
} from '@/ai/utils/thinkingStepsDisplayState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSummaryButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 24px;
  padding: 0;
  width: fit-content;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.blue};
    outline-offset: 2px;
  }
`;

const StyledSummaryText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledRowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRow = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 24px;
`;

const StyledRowLabel = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledReasoningContainer = styled.div`
  padding-left: ${({ theme }) => theme.spacing(5.5)};
`;

const StyledReasoningText = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  margin: 0;
  white-space: pre-wrap;
`;

const StyledOrbitLoaderIcon = styled(ThinkingOrbitLoaderIcon)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  justify-content: center;
  min-width: ${({ theme }) => theme.icon.size.sm}px;
`;

const StyledRowLabelContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
`;

const StyledChevronContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  justify-content: center;
`;

const ThinkingStepRow = ({
  isActive,
  part,
}: {
  isActive: boolean;
  part: ThinkingStepPart;
}) => {
  const getRowContent = (): {
    label: string;
    icon: ReturnType<typeof getToolIcon> | null;
    shouldShowOrbitLoader: boolean;
  } => {
    if (part.type === 'reasoning') {
      return {
        label: isActive ? t`Thinking` : t`Thought`,
        icon: IconCpu,
        shouldShowOrbitLoader: isActive,
      };
    }

    const rawToolName = part.type.split('-')[1];
    const { resolvedToolName } = resolveToolInput(part.input, rawToolName);

    return {
      label: getToolDisplayMessage(part.input, rawToolName, !isActive),
      icon: getToolIcon(resolvedToolName),
      shouldShowOrbitLoader: false,
    };
  };

  const { label, icon: Icon, shouldShowOrbitLoader } = getRowContent();

  return (
    <StyledRow>
      <StyledIconContainer>
        {shouldShowOrbitLoader ? (
          <StyledOrbitLoaderIcon />
        ) : (
          Icon && <Icon size={14} />
        )}
      </StyledIconContainer>
      <StyledRowLabelContainer>
        <StyledRowLabel>{label}</StyledRowLabel>
      </StyledRowLabelContainer>
      {!isActive && (
        <StyledChevronContainer>
          <IconChevronRight size={14} />
        </StyledChevronContainer>
      )}
    </StyledRow>
  );
};

export const ThinkingStepsDisplay = ({
  parts,
  isLastMessageStreaming,
}: {
  parts: ThinkingStepPart[];
  isLastMessageStreaming: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const stepCount = parts.length;
  const isThinking = parts.some((part) =>
    isThinkingStepPartActive(part, isLastMessageStreaming),
  );

  const activeReasoningContent = getActiveReasoningContent(parts);
  const finalReasoningContent = getLastReasoningContent(parts);
  const reasoningContent = isThinking
    ? activeReasoningContent
    : finalReasoningContent;
  const shouldDisplayReasoningContent = reasoningContent?.trim().length;

  const shouldRenderRows = isThinking || isExpanded;

  return (
    <StyledContainer>
      {!isThinking && (
        <StyledSummaryButton
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((previousValue) => !previousValue)}
        >
          {isExpanded ? (
            <IconChevronDown size={14} />
          ) : (
            <IconChevronRight size={14} />
          )}
          <StyledSummaryText>
            {plural(stepCount, {
              one: '# step',
              other: '# steps',
            })}
          </StyledSummaryText>
        </StyledSummaryButton>
      )}

      {shouldRenderRows && (
        <>
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
          </StyledRowsContainer>
          {!!shouldDisplayReasoningContent && (
            <StyledReasoningContainer>
              <StyledReasoningText>{reasoningContent}</StyledReasoningText>
            </StyledReasoningContainer>
          )}
        </>
      )}
    </StyledContainer>
  );
};
