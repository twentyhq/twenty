import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';
import { JsonTree } from 'twenty-ui/components/data-display';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { ThinkingStepRowLayout } from '@/ai/components/ThinkingStepRowLayout';
import { ToolRecordsWidget } from '@/ai/components/ToolRecordsWidget';
import { useToolDisplayContext } from '@/ai/hooks/useToolDisplayContext';
import { getToolIcon } from '@/ai/utils/getToolIcon';
import { getToolRecordOutput } from '@/ai/utils/getToolRecordOutput';
import { getToolDisplayMessage } from '@/ai/utils/tool-display/getToolDisplayMessage';
import { unwrapToolInput } from '@/ai/utils/tool-display/unwrapToolInput';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

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
  overflow-x: auto;
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
  const toolTabListComponentInstanceId = `ai-thinking-tool-tabs-${part.toolCallId ?? rawToolName}`;
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
    <ThinkingStepRowLayout
      icon={<ToolIcon size={14} />}
      label={displayMessage}
      isActive={isActive}
      details={
        isExpandable ? (
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
        ) : undefined
      }
    />
  );
};
