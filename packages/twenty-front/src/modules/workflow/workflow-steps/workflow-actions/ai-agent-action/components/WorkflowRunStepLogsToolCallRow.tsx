import { styled } from '@linaria/react';
import { useState } from 'react';
import { type AgentRunToolCallLog } from 'twenty-shared/ai';

import { useToolDisplayContext } from '@/ai/hooks/useToolDisplayContext';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import { getToolDisplayMessage } from '@/ai/utils/tool-display/getToolDisplayMessage';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { JsonTree } from 'twenty-ui/components/data-display';
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCircleX,
} from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${themeCssVariables.font.family};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledToggleButton = styled.button<{ isExpandable: boolean }>`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: ${({ isExpandable }) => (isExpandable ? 'pointer' : 'default')};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]} 0;
  text-align: left;
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease-in-out;
  width: 100%;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledRightContent = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledDisplayMessage = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledToolBadge = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${themeCssVariables.font.color.light};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};
`;

const StyledContentContainer = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledTabContainer = styled.div`
  gap: ${themeCssVariables.spacing[3]};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledJsonTreeContainer = styled.div`
  overflow-x: auto;
`;

const StyledErrorMessage = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: pre-wrap;
  word-break: break-word;
`;

type TabType = 'output' | 'input';

export const WorkflowRunStepLogsToolCallRow = ({
  toolCall,
}: {
  toolCall: AgentRunToolCallLog;
}) => {
  const theme = useTheme();
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('output');

  const hasError = toolCall.state === 'error';
  const hasOutput = isDefined(toolCall.output);
  const hasInput = isDefined(toolCall.input);
  const isExpandable = hasOutput || hasInput || hasError;
  const tabPanels = [
    { value: 'output', content: toolCall.output ?? t`No output` },
    { value: 'input', content: toolCall.input ?? t`No input` },
  ];

  const ToolIcon = getToolIcon(toolCall.toolName);
  const StatusIcon = hasError ? IconCircleX : IconCheck;
  const statusColor = hasError
    ? themeCssVariables.color.red
    : themeCssVariables.color.green;

  const displayContext = useToolDisplayContext();
  const displayMessage = getToolDisplayMessage({
    input: toolCall.input ?? {},
    toolName: toolCall.toolName,
    isFinished: true,
    displayContext,
    output: toolCall.output,
  });

  return (
    <StyledContainer>
      <StyledToggleButton
        type="button"
        isExpandable={isExpandable}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        <StyledLeftContent>
          <StyledIconContainer>
            <ToolIcon size={theme.icon.size.sm} />
          </StyledIconContainer>
          <StyledDisplayMessage>{displayMessage}</StyledDisplayMessage>
        </StyledLeftContent>
        <StyledRightContent>
          <StyledToolBadge>{toolCall.toolName}</StyledToolBadge>
          <StyledIconContainer style={{ color: statusColor }}>
            <StatusIcon size={theme.icon.size.sm} />
          </StyledIconContainer>
          {isExpandable &&
            (isExpanded ? (
              <IconChevronUp size={theme.icon.size.sm} />
            ) : (
              <IconChevronDown size={theme.icon.size.sm} />
            ))}
        </StyledRightContent>
      </StyledToggleButton>

      {isExpandable && (
        <Collapsible.Root open={isExpanded}>
          <Collapsible.Panel>
            <StyledContentContainer>
              {hasError && isDefined(toolCall.errorMessage) ? (
                <StyledErrorMessage>{toolCall.errorMessage}</StyledErrorMessage>
              ) : (
                <Tabs.Root
                  value={activeTab}
                  onValueChange={(value) => {
                    if (value !== 'output' && value !== 'input') {
                      return;
                    }
                    setActiveTab(value);
                  }}
                >
                  <Tabs.List
                    aria-label={t`Tool call details`}
                    render={<StyledTabContainer />}
                  >
                    <Tabs.Tab value="output" size="compact">
                      {t`Output`}
                    </Tabs.Tab>
                    <Tabs.Tab value="input" size="compact">
                      {t`Input`}
                    </Tabs.Tab>
                    <Tabs.Indicator />
                  </Tabs.List>
                  {tabPanels.map(({ value, content }) => (
                    <Tabs.Panel key={value} value={value}>
                      <StyledJsonTreeContainer>
                        <JsonTree
                          value={content as JsonValue}
                          shouldExpandNodeInitially={() => false}
                          emptyArrayLabel={t`Empty Array`}
                          emptyObjectLabel={t`Empty Object`}
                          emptyStringLabel={t`[empty string]`}
                          arrowButtonCollapsedLabel={t`Expand`}
                          arrowButtonExpandedLabel={t`Collapse`}
                          onNodeValueClick={copyToClipboard}
                        />
                      </StyledJsonTreeContainer>
                    </Tabs.Panel>
                  ))}
                </Tabs.Root>
              )}
            </StyledContentContainer>
          </Collapsible.Panel>
        </Collapsible.Root>
      )}
    </StyledContainer>
  );
};
