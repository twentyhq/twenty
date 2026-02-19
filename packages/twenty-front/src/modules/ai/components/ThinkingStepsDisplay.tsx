import styled from '@emotion/styled';
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
import { type JsonValue } from 'type-fest';

import { ToolOutputResultSchema } from '@/ai/schemas/toolOutputResultSchema';
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
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.font.family};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledStepsContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSummaryText = styled.span`
  color: inherit;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  transition: color ${({ theme }) => theme.animation.duration.fast}s ease-in-out;
`;

const StyledSummaryButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 24px;
  padding: 0;
  width: fit-content;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.blue};
    outline-offset: 2px;
  }
`;

const StyledSummaryChevronContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  justify-content: center;
  transform: rotate(${({ isExpanded }) => (isExpanded ? '90deg' : '0deg')});
  transition: transform ${({ theme }) => theme.animation.duration.fast}s
    ease-in-out;
`;

const StyledRowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRow = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 24px;
`;

const StyledRowLabel = styled.span`
  color: inherit;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  transition: color ${({ theme }) => theme.animation.duration.fast}s ease-in-out;
`;

const StyledToolRowLabel = styled.div`
  color: inherit;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color ${({ theme }) => theme.animation.duration.fast}s ease-in-out;
  white-space: nowrap;
`;

const StyledReasoningContainer = styled.div`
  padding-left: calc(
    ${({ theme }) => theme.icon.size.sm}px + ${({ theme }) => theme.spacing(2)}
  );
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
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  justify-content: center;
  min-width: ${({ theme }) => theme.icon.size.sm}px;
`;

const StyledRowLabelContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

const StyledChevronContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  justify-content: center;
  transform: rotate(${({ isExpanded }) => (isExpanded ? '90deg' : '0deg')});
  transition: transform ${({ theme }) => theme.animation.duration.fast}s
    ease-in-out;
`;

const StyledToolRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledToolRowButton = styled.button<{ isExpandable: boolean }>`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'default')};
  display: flex;
  font-family: inherit;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 24px;
  padding: 0;
  text-align: left;
  transition: color ${({ theme }) => theme.animation.duration.fast}s ease-in-out;
  width: 100%;

  &:hover {
    color: ${({ theme, isExpandable }) =>
      isExpandable ? theme.font.color.primary : theme.font.color.tertiary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.blue};
    outline-offset: 2px;
  }
`;

const StyledToolDetailsContainer = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin-left: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
  overflow: hidden;
`;

const StyledToolTabList = styled(TabList)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledToolDetailsContent = styled.div`
  min-width: 0;
`;

const StyledToolJsonContent = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledJsonTreeContainer = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
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
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
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

  const outputResult = ToolOutputResultSchema.safeParse(part.output);
  const unwrappedOutput =
    rawToolName === 'execute_tool' && outputResult.success
      ? outputResult.data.result
      : part.output;
  const unwrappedResult = ToolOutputResultSchema.safeParse(unwrappedOutput);
  const toolOutput = unwrappedResult.success
    ? unwrappedResult.data.result
    : unwrappedOutput;
  const toolTabListComponentInstanceId = `ai-thinking-tool-tabs-${part.toolCallId ?? rawToolName}-${rowIndex}`;
  const activeToolTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    toolTabListComponentInstanceId,
  );
  const activeTab: ToolDetailsTab =
    activeToolTabId === 'input' ? 'input' : 'output';
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
                <StyledToolTabList
                  tabs={toolTabs}
                  behaveAsLinks={false}
                  componentInstanceId={toolTabListComponentInstanceId}
                />
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
        {isActive ? <StyledOrbitLoaderIcon /> : <IconCpu size={14} />}
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
