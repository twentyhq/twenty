import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { type ToolUIPart } from 'ai';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronRight,
  IconCpu,
  OverflowingTextWithTooltip,
  ThinkingOrbitLoaderIcon,
  TooltipDelay,
} from 'twenty-ui/display';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type JsonValue } from 'type-fest';

import { getToolIcon } from '@/ai/utils/getToolIcon';
import {
  getToolDisplayMessage,
  resolveToolInput,
} from '@/ai/utils/getToolDisplayMessage';
import { getActiveReasoningContent } from '@/ai/utils/getActiveReasoningContent';
import { getLastReasoningContent } from '@/ai/utils/getLastReasoningContent';
import { isThinkingStepPartActive } from '@/ai/utils/isThinkingStepPartActive';
import { type ThinkingStepPart } from '@/ai/utils/thinkingStepPart';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

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

const StyledToolRowLabel = styled.div`
  color: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.md};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
  white-space: nowrap;
`;

const StyledReasoningContainer = styled.div`
  padding-left: calc(
    ${themeCssVariables.icon.size.sm} * 1px + ${themeCssVariables.spacing[2]}
  );
`;

const StyledReasoningText = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin: 0;
  white-space: pre-wrap;
`;

const StyledOrbitLoaderIconContainer = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
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

const StyledChevronContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  justify-content: center;
  transform: rotate(${({ isExpanded }) => (isExpanded ? '90deg' : '0deg')});
  transition: transform calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
`;

const StyledToolRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledToolRowButton = styled.button<{ isExpandable: boolean }>`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'default')};
  display: flex;
  font-family: inherit;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 24px;
  padding: 0;
  text-align: left;
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
  width: 100%;

  &:hover {
    color: ${({ isExpandable }) =>
      isExpandable
        ? themeCssVariables.font.color.primary
        : themeCssVariables.font.color.tertiary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }
`;

const StyledToolDetailsContainer = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  margin-left: ${themeCssVariables.spacing[3]};
  min-width: 0;
  overflow: hidden;
`;

const StyledToolTabListContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledToolDetailsContent = styled.div`
  min-width: 0;
`;

const StyledToolJsonContent = styled.div`
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledJsonTreeContainer = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  overflow-x: auto;

  li,
  span {
    line-height: 1;
  }

  ul {
    min-width: 0;
  }
`;

const StyledToolErrorText = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin: 0;
  white-space: pre-wrap;
`;

type ToolDetailsTab = 'output' | 'input';

const ThinkingToolStepRow = ({
  isActive,
  part,
  rowIndex,
}: {
  isActive: boolean;
  part: ToolUIPart;
  rowIndex: number;
}) => {
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const rawToolName = part.type.split('-')[1];
  const { resolvedInput: toolInput, resolvedToolName } = resolveToolInput(
    part.input,
    rawToolName,
  );

  const ToolIcon = getToolIcon(resolvedToolName);
  const label = getToolDisplayMessage(part.input, rawToolName, !isActive);
  const hasError = isDefined(part.errorText);
  const isExpandable = isDefined(part.output) || hasError;

  const outputObj =
    typeof part.output === 'object' && part.output !== null
      ? (part.output as Record<string, unknown>)
      : null;
  const toolError =
    typeof outputObj?.error === 'string' ? outputObj.error : null;
  const toolOutput = toolError ? { error: toolError } : outputObj;
  const toolTabListComponentInstanceId = `ai-thinking-tool-tabs-${part.toolCallId ?? rawToolName}-${rowIndex}`;
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    toolTabListComponentInstanceId,
  );
  const activeTab: ToolDetailsTab =
    activeTabId === 'input' ? 'input' : 'output';
  const toolTabs = [
    { id: 'output', title: t`Output` },
    { id: 'input', title: t`Input` },
  ];

  return (
    <StyledToolRowContainer>
      <StyledToolRowButton
        type="button"
        isExpandable={isExpandable}
        onClick={() => {
          if (!isExpandable) {
            return;
          }

          setIsExpanded((previousValue) => !previousValue);
        }}
        aria-expanded={isExpandable ? isExpanded : undefined}
      >
        <StyledIconContainer>
          <ToolIcon size={14} />
        </StyledIconContainer>
        <StyledRowLabelContainer>
          <StyledToolRowLabel>
            <OverflowingTextWithTooltip
              text={label}
              tooltipDelay={TooltipDelay.shortDelay}
            />
          </StyledToolRowLabel>
          {isExpandable && (
            <StyledChevronContainer isExpanded={isExpanded}>
              <IconChevronRight size={14} />
            </StyledChevronContainer>
          )}
        </StyledRowLabelContainer>
      </StyledToolRowButton>

      {isExpandable && (
        <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
          <StyledToolDetailsContainer>
            {hasError ? (
              <StyledToolErrorText>{part.errorText}</StyledToolErrorText>
            ) : (
              <StyledToolDetailsContent>
                <StyledToolTabListContainer>
                  <TabList
                    tabs={toolTabs}
                    behaveAsLinks={false}
                    componentInstanceId={toolTabListComponentInstanceId}
                  />
                </StyledToolTabListContainer>
                <StyledToolJsonContent>
                  <StyledJsonTreeContainer>
                    <JsonTree
                      value={
                        (activeTab === 'output'
                          ? toolOutput
                          : toolInput) as JsonValue
                      }
                      shouldExpandNodeInitially={() => false}
                      emptyArrayLabel={t`Empty Array`}
                      emptyObjectLabel={t`Empty Object`}
                      emptyStringLabel={t`[empty string]`}
                      arrowButtonCollapsedLabel={t`Expand`}
                      arrowButtonExpandedLabel={t`Collapse`}
                      onNodeValueClick={copyToClipboard}
                    />
                  </StyledJsonTreeContainer>
                </StyledToolJsonContent>
              </StyledToolDetailsContent>
            )}
          </StyledToolDetailsContainer>
        </AnimatedExpandableContainer>
      )}
    </StyledToolRowContainer>
  );
};

const ThinkingStepRow = ({
  isActive,
  part,
  rowIndex,
}: {
  isActive: boolean;
  part: ThinkingStepPart;
  rowIndex: number;
}) => {
  if (part.type !== 'reasoning') {
    return (
      <ThinkingToolStepRow
        part={part}
        isActive={isActive}
        rowIndex={rowIndex}
      />
    );
  }

  return (
    <StyledRow>
      <StyledIconContainer>
        {isActive ? (
          <StyledOrbitLoaderIconContainer>
            <ThinkingOrbitLoaderIcon />
          </StyledOrbitLoaderIconContainer>
        ) : (
          <IconCpu size={14} />
        )}
      </StyledIconContainer>
      <StyledRowLabelContainer>
        <StyledRowLabel>{isActive ? t`Thinking` : t`Thought`}</StyledRowLabel>
      </StyledRowLabelContainer>
    </StyledRow>
  );
};

export const ThinkingStepsDisplay = ({
  parts,
  isLastMessageStreaming,
  hasAssistantTextResponseStarted,
}: {
  parts: ThinkingStepPart[];
  isLastMessageStreaming: boolean;
  hasAssistantTextResponseStarted: boolean;
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
  const shouldKeepExpandedBeforeAnswer = !hasAssistantTextResponseStarted;
  const shouldShowSummaryButton =
    !isThinking && !shouldKeepExpandedBeforeAnswer;

  const shouldRenderRows =
    isThinking || isExpanded || shouldKeepExpandedBeforeAnswer;

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
                rowIndex={index}
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
        </StyledStepsContentContainer>
      )}
    </StyledContainer>
  );
};
