import { styled } from '@linaria/react';
import { useState } from 'react';
import { type AgentRunToolCallLog } from 'twenty-shared/ai';

import { useToolDisplayContext } from '@/ai/hooks/useToolDisplayContext';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import { getToolDisplayMessage } from '@/ai/utils/tool-display/getToolDisplayMessage';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { JsonTree } from 'twenty-ui/components/data-display';
import { IconCheck, IconChevronDown, IconCircleX } from 'twenty-ui/icon';
import { Badge } from 'twenty-ui/primitives/data-display';
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

const StyledToggleRow = styled.div<{ isExpandable: boolean }>`
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
    color: ${({ isExpandable }) =>
      isExpandable
        ? themeCssVariables.font.color.primary
        : themeCssVariables.font.color.tertiary};
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

const StyledChevron = styled.span`
  display: flex;
  transform: rotate(0deg);

  [data-panel-open] & {
    transform: rotate(180deg);
  }
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

  const rowContent = (
    <>
      <StyledLeftContent>
        <StyledIconContainer>
          <ToolIcon size={theme.icon.size.sm} />
        </StyledIconContainer>
        <StyledDisplayMessage>{displayMessage}</StyledDisplayMessage>
      </StyledLeftContent>
      <StyledRightContent>
        <Badge size="sm">{toolCall.toolName}</Badge>
        <StyledIconContainer style={{ color: statusColor }}>
          <StatusIcon size={theme.icon.size.sm} />
        </StyledIconContainer>
        {isExpandable && (
          <StyledChevron>
            <IconChevronDown size={theme.icon.size.sm} />
          </StyledChevron>
        )}
      </StyledRightContent>
    </>
  );

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={setIsExpanded}
      render={<StyledContainer />}
    >
      {isExpandable ? (
        <Collapsible.Trigger
          render={<StyledToggleRow as="button" isExpandable />}
        >
          {rowContent}
        </Collapsible.Trigger>
      ) : (
        <StyledToggleRow isExpandable={false}>{rowContent}</StyledToggleRow>
      )}

      {isExpandable && (
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
      )}
    </Collapsible.Root>
  );
};
