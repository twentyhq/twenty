import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { IconChevronRight, ThinkingOrbitLoaderIcon } from 'twenty-ui/icon';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { getToolName } from 'ai';

import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { ThinkingReasoningStepRow } from '@/ai/components/ThinkingReasoningStepRow';
import { ThinkingToolStepRow } from '@/ai/components/ThinkingToolStepRow';
import { useToolDisplayContext } from '@/ai/hooks/useToolDisplayContext';
import { getReasoningStepLabel } from '@/ai/utils/getReasoningStepLabel';
import { isThinkingStepPartActive } from '@/ai/utils/isThinkingStepPartActive';
import { getToolDisplayMessage } from '@/ai/utils/tool-display/getToolDisplayMessage';
import { type ThinkingStepPart } from '@/ai/types/ThinkingStepPart';
import { formatRoundedDuration } from '~/utils/format/formatRoundedDuration';

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
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
  white-space: nowrap;
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
  max-width: 100%;
  min-height: 24px;
  min-width: 0;
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

const StyledChevronContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  min-width: calc(${themeCssVariables.icon.size.sm} * 1px);
  transform: rotate(0deg);
  transition: transform calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;

  [data-panel-open] & {
    transform: rotate(90deg);
  }
`;

const StyledStepCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.md};
  white-space: nowrap;
`;

const StyledShimmeringRowLabel = styled(ShimmeringText)`
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.md};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  min-width: calc(${themeCssVariables.icon.size.sm} * 1px);
`;

const ThinkingStepRow = ({
  isActive,
  part,
}: {
  isActive: boolean;
  part: ThinkingStepPart;
}) =>
  part.type === 'reasoning' ? (
    <ThinkingReasoningStepRow part={part} isActive={isActive} />
  ) : (
    <ThinkingToolStepRow part={part} isActive={isActive} />
  );

export const ThinkingStepsDisplay = ({
  parts,
  isLastMessageStreaming,
  isTrailingWhileStreaming = false,
  workDurationMs,
}: {
  parts: ThinkingStepPart[];
  isLastMessageStreaming: boolean;
  isTrailingWhileStreaming?: boolean;
  workDurationMs?: number | null;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayContext = useToolDisplayContext();

  const stepCountLabel = plural(parts.length, {
    one: '# step',
    other: '# steps',
  });
  const activePart = parts.findLast((part) =>
    isThinkingStepPartActive(part, isLastMessageStreaming),
  );
  const isWorking =
    isLastMessageStreaming &&
    (isDefined(activePart) || isTrailingWhileStreaming);

  const getWorkingLabel = () => {
    if (!isDefined(activePart)) {
      return t`Thinking`;
    }

    if (activePart.type === 'reasoning') {
      return getReasoningStepLabel({ text: activePart.text, isActive: true });
    }

    return getToolDisplayMessage({
      input: activePart.input,
      toolName: getToolName(activePart),
      isFinished: false,
      displayContext,
      output: activePart.output,
    });
  };

  const summaryLabel =
    isDefined(workDurationMs) && !isLastMessageStreaming
      ? t`Worked for ${formatRoundedDuration(workDurationMs)}`
      : stepCountLabel;

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={setIsExpanded}
      render={<StyledContainer />}
    >
      <Collapsible.Trigger render={<StyledSummaryButton />}>
        {isWorking ? (
          <StyledIconContainer>
            <ThinkingOrbitLoaderIcon />
          </StyledIconContainer>
        ) : (
          <StyledChevronContainer>
            <IconChevronRight size={14} />
          </StyledChevronContainer>
        )}
        {isWorking ? (
          <StyledShimmeringRowLabel>
            {getWorkingLabel()}
          </StyledShimmeringRowLabel>
        ) : (
          <StyledSummaryText>{summaryLabel}</StyledSummaryText>
        )}
        {isWorking && parts.length > 1 && (
          <StyledStepCount>{stepCountLabel}</StyledStepCount>
        )}
      </Collapsible.Trigger>

      <Collapsible.Panel>
        <StyledStepsContentContainer>
          {parts.map((part, index) => (
            <ThinkingStepRow
              key={index}
              part={part}
              isActive={isThinkingStepPartActive(part, isLastMessageStreaming)}
            />
          ))}
        </StyledStepsContentContainer>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
