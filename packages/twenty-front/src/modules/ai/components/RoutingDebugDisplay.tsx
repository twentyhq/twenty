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

export const RoutingDebugDisplay = ({
  debug,
}: {
  debug: NonNullable<DataMessagePart['routing-status']['debug']>;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('timing');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const renderTimingRow = (
    label: string,
    value: string | number | undefined,
  ) => {
    if (value === undefined) return null;

    return (
      <StyledTimingRow key={label}>
        <StyledTimingLabel>{label}</StyledTimingLabel>
        <StyledTimingValue>{value}</StyledTimingValue>
      </StyledTimingRow>
    );
  };

  const formatTokenBreakdown = (
    total: number,
    prompt?: number,
    completion?: number,
  ) => {
    const formattedTotal = formatNumber(total);
    if (
      prompt !== undefined &&
      completion !== undefined &&
      prompt > 0 &&
      completion > 0
    ) {
      return `${formattedTotal} (${formatNumber(prompt)} → ${formatNumber(completion)})`;
    }
    return formattedTotal;
  };

  const renderTimingTab = () => {
    const totalTime =
      debug.agentExecutionStartTimeMs !== undefined
        ? `${debug.agentExecutionStartTimeMs + (debug.agentExecutionTimeMs || 0)}ms`
        : undefined;

    return (
      <StyledTimingSection>
        {renderTimingRow('Routing decision', debug.routingTimeMs && `${debug.routingTimeMs}ms`)}
        {renderTimingRow('Context building (routing)', debug.contextBuildTimeMs && `${debug.contextBuildTimeMs}ms`)}
        {renderTimingRow('Context building (agent)', debug.agentContextBuildTimeMs && `${debug.agentContextBuildTimeMs}ms`)}
        {renderTimingRow('Tool generation', debug.toolGenerationTimeMs && `${debug.toolGenerationTimeMs}ms`)}
        {renderTimingRow('AI request prep', debug.aiRequestPrepTimeMs && `${debug.aiRequestPrepTimeMs}ms`)}
        {renderTimingRow('Time to first token', debug.timeToFirstTokenMs && `${debug.timeToFirstTokenMs}ms`)}
        {renderTimingRow('Agent execution', debug.agentExecutionTimeMs && `${debug.agentExecutionTimeMs}ms`)}
        {renderTimingRow('Total time', totalTime)}
        {renderTimingRow('Available tools', debug.toolCount)}
        {renderTimingRow('Tool calls made', debug.toolCallCount)}
        {renderTimingRow('Context records', debug.contextRecordCount)}
        {renderTimingRow('Context size', debug.contextSizeBytes !== undefined ? formatBytes(debug.contextSizeBytes) : undefined)}
        {renderTimingRow(
          'Routing tokens',
          debug.routingTotalTokens !== undefined
            ? formatTokenBreakdown(
                debug.routingTotalTokens,
                debug.routingPromptTokens,
                debug.routingCompletionTokens,
              )
            : undefined,
        )}
        {renderTimingRow(
          'Agent tokens',
          debug.agentTotalTokens !== undefined
            ? formatTokenBreakdown(
                debug.agentTotalTokens,
                debug.agentPromptTokens,
                debug.agentCompletionTokens,
              )
            : undefined,
        )}
        {renderTimingRow('Total cost', debug.totalCostInCredits !== undefined ? `${formatNumber(debug.totalCostInCredits)} credits` : undefined)}
      </StyledTimingSection>
    );
  };

  const renderDetailsTab = () => {
    const detailsData = {
      selectedAgent: {
        id: debug.selectedAgentId,
        label: debug.selectedAgentLabel,
      },
      routerModel: debug.routerModel,
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

  const renderContextTab = () => {
    if (!debug.context) {
      return (
        <StyledTimingLabel>
          No context was provided for this request
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
      return <StyledTimingLabel>{debug.context}</StyledTimingLabel>;
    }
  };

  return (
    <StyledContainer>
      <StyledToggleButton onClick={() => setIsExpanded(!isExpanded)}>
        <StyledTimingLabel>Debug Info</StyledTimingLabel>
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
              Timing
            </StyledTab>
            <StyledTab
              isActive={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
            >
              Details
            </StyledTab>
            {debug.context && (
              <StyledTab
                isActive={activeTab === 'context'}
                onClick={() => setActiveTab('context')}
              >
                Context
              </StyledTab>
            )}
          </StyledTabContainer>

          {activeTab === 'timing' && renderTimingTab()}
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'context' && renderContextTab()}
        </StyledContentContainer>
      </AnimatedExpandableContainer>
    </StyledContainer>
  );
};
