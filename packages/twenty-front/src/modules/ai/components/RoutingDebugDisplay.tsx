import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';

import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { useLingui } from '@lingui/react/macro';
import { type DataMessagePart } from 'twenty-shared/ai';
import { type JsonValue } from 'type-fest';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledToggleButton = styled.div`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
  transition: color ${({ theme }) => theme.animation.duration.normal}s;
  font-size: ${({ theme }) => theme.font.size.sm};

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledContentContainer = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledJsonTreeContainer = styled.div`
  overflow-x: auto;

  ul {
    min-width: 0;
  }
`;

const StyledTabContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledTab = styled.div<{ isActive: boolean }>`
  color: ${({ theme, isActive }) =>
    isActive ? theme.font.color.primary : theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme, isActive }) =>
    isActive ? theme.font.weight.medium : theme.font.weight.regular};
  cursor: pointer;
  transition: color ${({ theme }) => theme.animation.duration.normal}s;
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledTimingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTimingRow = styled.div`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

const StyledTimingLabel = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledTimingValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type TabType = 'timing' | 'details' | 'context';

type TimingRowProps = {
  label: string;
  value: string | number | undefined;
};

const TimingRow = ({ label, value }: TimingRowProps) => {
  if (value === undefined) {
    return null;
  }

  return (
    <StyledTimingRow>
      <StyledTimingLabel>{label}</StyledTimingLabel>
      <StyledTimingValue>{value}</StyledTimingValue>
    </StyledTimingRow>
  );
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

const formatNumber = (num: number) => num.toLocaleString();

const formatTokenBreakdown = (
  total: number,
  prompt?: number,
  completion?: number,
) => {
  const formattedTotal = formatNumber(total);
  const hasValidBreakdown =
    prompt !== undefined &&
    completion !== undefined &&
    prompt > 0 &&
    completion > 0;

  if (hasValidBreakdown) {
    return `${formattedTotal} (${formatNumber(prompt)} → ${formatNumber(completion)})`;
  }

  return formattedTotal;
};

type DebugInfo = NonNullable<DataMessagePart['routing-status']['debug']>;

type TimingTabProps = {
  debug: DebugInfo;
};

const TimingTab = ({ debug }: TimingTabProps) => {
  const { t } = useLingui();
  const totalTime =
    debug.agentExecutionStartTimeMs !== undefined
      ? `${debug.agentExecutionStartTimeMs + (debug.agentExecutionTimeMs || 0)}ms`
      : undefined;

  const totalCost =
    debug.totalCostInCredits !== undefined
      ? formatNumber(debug.totalCostInCredits)
      : undefined;

  return (
    <StyledTimingSection>
      <TimingRow
        label={t`Routing decision`}
        value={debug.routingTimeMs && `${debug.routingTimeMs}ms`}
      />
      <TimingRow
        label={t`Context building (routing)`}
        value={debug.contextBuildTimeMs && `${debug.contextBuildTimeMs}ms`}
      />
      <TimingRow
        label={t`Context building (agent)`}
        value={
          debug.agentContextBuildTimeMs && `${debug.agentContextBuildTimeMs}ms`
        }
      />
      <TimingRow
        label={t`Tool generation`}
        value={debug.toolGenerationTimeMs && `${debug.toolGenerationTimeMs}ms`}
      />
      <TimingRow
        label={t`AI request prep`}
        value={debug.aiRequestPrepTimeMs && `${debug.aiRequestPrepTimeMs}ms`}
      />
      <TimingRow
        label={t`Agent execution`}
        value={debug.agentExecutionTimeMs && `${debug.agentExecutionTimeMs}ms`}
      />
      <TimingRow label={t`Total time`} value={totalTime} />
      <TimingRow label={t`Available tools`} value={debug.toolCount} />
      <TimingRow label={t`Tool calls made`} value={debug.toolCallCount} />
      <TimingRow label={t`Context records`} value={debug.contextRecordCount} />
      <TimingRow
        label={t`Context size`}
        value={
          debug.contextSizeBytes !== undefined
            ? formatBytes(debug.contextSizeBytes)
            : undefined
        }
      />
      <TimingRow
        label={t`Routing tokens`}
        value={
          debug.routingTotalTokens !== undefined
            ? formatTokenBreakdown(
                debug.routingTotalTokens,
                debug.routingPromptTokens,
                debug.routingCompletionTokens,
              )
            : undefined
        }
      />
      <TimingRow
        label={t`Agent tokens`}
        value={
          debug.agentTotalTokens !== undefined
            ? formatTokenBreakdown(
                debug.agentTotalTokens,
                debug.agentPromptTokens,
                debug.agentCompletionTokens,
              )
            : undefined
        }
      />
      <TimingRow
        label={t`Total cost`}
        value={totalCost !== undefined ? t`${totalCost} credits` : undefined}
      />
    </StyledTimingSection>
  );
};

type DetailsTabProps = {
  debug: DebugInfo;
  copyToClipboard: (value: string) => void;
};

const DetailsTab = ({ debug, copyToClipboard }: DetailsTabProps) => {
  const { t } = useLingui();

  const detailsData = {
    selectedAgent: {
      id: debug.selectedAgentId,
      label: debug.selectedAgentLabel,
    },
    fastModel: debug.fastModel,
    smartModel: debug.smartModel,
    agentModel: debug.agentModel,
    availableAgents: debug.availableAgents,
  };

  return (
    <StyledJsonTreeContainer>
      <JsonTree
        value={detailsData as JsonValue}
        shouldExpandNodeInitially={() => true}
        emptyArrayLabel={t`Empty Array`}
        emptyObjectLabel={t`Empty Object`}
        emptyStringLabel={t`[empty string]`}
        arrowButtonCollapsedLabel={t`Expand`}
        arrowButtonExpandedLabel={t`Collapse`}
        onNodeValueClick={copyToClipboard}
      />
    </StyledJsonTreeContainer>
  );
};

type ContextTabProps = {
  debug: DebugInfo;
  copyToClipboard: (value: string) => void;
};

const ContextTab = ({ debug, copyToClipboard }: ContextTabProps) => {
  const { t } = useLingui();

  if (!debug.context) {
    return (
      <StyledTimingLabel>
        {t`No context was provided for this request`}
      </StyledTimingLabel>
    );
  }

  try {
    const contextData = JSON.parse(debug.context);

    return (
      <StyledJsonTreeContainer>
        <JsonTree
          value={contextData as JsonValue}
          shouldExpandNodeInitially={() => false}
          emptyArrayLabel={t`Empty Array`}
          emptyObjectLabel={t`Empty Object`}
          emptyStringLabel={t`[empty string]`}
          arrowButtonCollapsedLabel={t`Expand`}
          arrowButtonExpandedLabel={t`Collapse`}
          onNodeValueClick={copyToClipboard}
        />
      </StyledJsonTreeContainer>
    );
  } catch {
    const contextValue = debug.context;
    return (
      <StyledTimingLabel>
        {t`Failed to parse context: ${contextValue}`}
      </StyledTimingLabel>
    );
  }
};

type RoutingDebugDisplayProps = {
  debug: DebugInfo;
};

export const RoutingDebugDisplay = ({ debug }: RoutingDebugDisplayProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('timing');

  return (
    <StyledContainer>
      <StyledToggleButton onClick={() => setIsExpanded(!isExpanded)}>
        <StyledTimingLabel>{t`Debug Info`}</StyledTimingLabel>
        {isExpanded ? (
          <IconChevronUp size={theme.icon.size.sm} />
        ) : (
          <IconChevronDown size={theme.icon.size.sm} />
        )}
      </StyledToggleButton>

      <AnimatedExpandableContainer isExpanded={isExpanded} mode="fit-content">
        <StyledContentContainer>
          <StyledTabContainer>
            <StyledTab
              isActive={activeTab === 'timing'}
              onClick={() => setActiveTab('timing')}
            >
              {t`Timing`}
            </StyledTab>
            <StyledTab
              isActive={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
            >
              {t`Details`}
            </StyledTab>
            {debug.context && (
              <StyledTab
                isActive={activeTab === 'context'}
                onClick={() => setActiveTab('context')}
              >
                {t`Context`}
              </StyledTab>
            )}
          </StyledTabContainer>

          {activeTab === 'timing' && <TimingTab debug={debug} />}
          {activeTab === 'details' && (
            <DetailsTab debug={debug} copyToClipboard={copyToClipboard} />
          )}
          {activeTab === 'context' && (
            <ContextTab debug={debug} copyToClipboard={copyToClipboard} />
          )}
        </StyledContentContainer>
      </AnimatedExpandableContainer>
    </StyledContainer>
  );
};
