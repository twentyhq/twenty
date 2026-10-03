import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { useState } from 'react';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';
import { JsonTree } from 'twenty-ui/components';
import { IconChevronRight } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { ShimmeringText } from '@/ai/components/ShimmeringText';
import { ToolRecordsWidget } from '@/ai/components/ToolRecordsWidget';
import { useToolDisplayContext } from '@/ai/hooks/useToolDisplayContext';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import { getToolRecordOutput } from '@/ai/utils/getToolRecordOutput';
import { getToolDisplayMessage } from '@/ai/utils/tool-display/getToolDisplayMessage';
import { unwrapToolInput } from '@/ai/utils/tool-display/unwrapToolInput';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

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

const StyledShimmeringLabel = styled(ShimmeringText)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledToolDetailsContainer = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  margin-left: ${themeCssVariables.spacing[3]};
  min-width: 0;
  overflow: hidden;
`;

const StyledToolRecordsContainer = styled.div`
  padding: 0 ${themeCssVariables.spacing[2]};
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

type ThinkingToolStepRowProps = {
  isActive: boolean;
  part: ToolUIPart | DynamicToolUIPart;
};

export const ThinkingToolStepRow = ({
  isActive,
  part,
}: ThinkingToolStepRowProps) => {
  const { copyToClipboard } = useCopyToClipboard();
  const [isExpanded, setIsExpanded] = useState(false);
  const rawToolName = getToolName(part);
  const { toolInput, toolName } = unwrapToolInput({
    input: part.input,
    toolName: rawToolName,
  });

  const displayContext = useToolDisplayContext();
  const ToolIcon = getToolIcon(toolName);
  const displayMessage = getToolDisplayMessage({
    input: part.input,
    toolName: rawToolName,
    isFinished: !isActive,
    displayContext,
    output: part.output,
  });
  const hasError = isDefined(part.errorText);
  const { message: recordsMessage, recordReferences } =
    getToolRecordOutput(part);
  const isExpandable = isDefined(part.output) || hasError;

  const toolOutput =
    isPlainObject(part.output) && isNonEmptyString(part.output.error)
      ? { error: part.output.error }
      : part.output;
  const toolTabListComponentInstanceId = `ai-thinking-tool-tabs-${part.toolCallId}`;
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
            {isActive ? (
              <StyledShimmeringLabel>{displayMessage}</StyledShimmeringLabel>
            ) : (
              <OverflowingTextWithTooltip
                text={displayMessage}
                tooltipDelay={TooltipDelay.shortDelay}
              />
            )}
          </StyledToolRowLabel>
          {isExpandable && (
            <StyledChevronContainer isExpanded={isExpanded}>
              <IconChevronRight size={14} />
            </StyledChevronContainer>
          )}
        </StyledRowLabelContainer>
      </StyledToolRowButton>

      {isExpandable && (
        <Collapsible isExpanded={isExpanded}>
          <StyledToolDetailsContainer>
            {isNonEmptyArray(recordReferences) && (
              <StyledToolRecordsContainer>
                <ToolRecordsWidget
                  message={recordsMessage ?? ''}
                  recordReferences={recordReferences}
                />
              </StyledToolRecordsContainer>
            )}
            {hasError ? (
              <StyledToolErrorText>{part.errorText}</StyledToolErrorText>
            ) : (
              <TabListRoot componentInstanceId={toolTabListComponentInstanceId}>
                <StyledToolDetailsContent>
                  <StyledToolTabListContainer>
                    <TabList
                      aria-label={t`Tool details: ${displayMessage}`}
                      tabs={toolTabs}
                      behaveAsLinks={false}
                      componentInstanceId={toolTabListComponentInstanceId}
                    />
                  </StyledToolTabListContainer>
                  <Tabs.Panel
                    value={activeTab}
                    render={<StyledToolJsonContent />}
                  >
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
                  </Tabs.Panel>
                </StyledToolDetailsContent>
              </TabListRoot>
            )}
          </StyledToolDetailsContainer>
        </Collapsible>
      )}
    </StyledToolRowContainer>
  );
};
