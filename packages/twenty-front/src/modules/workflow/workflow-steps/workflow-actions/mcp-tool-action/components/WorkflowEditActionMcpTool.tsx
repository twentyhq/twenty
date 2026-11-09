import { useFindManyMcpServers } from '@/mcp-servers/hooks/useFindManyMcpServers';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepCmdEnterButton } from '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowStepTabPanel } from '@/workflow/workflow-steps/components/WorkflowStepTabPanel';
import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/mergeDefaultFunctionInputAndFunctionInput';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';
import { useMcpToolStepForm } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/hooks/useMcpToolStepForm';
import { McpToolExpectedOutputAdvancedSection } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/components/McpToolExpectedOutputAdvancedSection';
import { McpToolTestResult } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/components/McpToolTestResult';
import { McpToolTestVariableInput } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/components/McpToolTestVariableInput';
import { WORKFLOW_MCP_TOOL_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/constants/WorkflowMcpToolTabListComponentId';
import { useTestMcpTool } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/hooks/useTestMcpTool';
import { type WorkflowMcpToolTabId } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/types/WorkflowMcpToolTabId';
import { isMcpToolSafeToTestWithoutConfirmation } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/utils/isMcpToolSafeToTestWithoutConfirmation';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isObject } from '@sniptt/guards';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';
import { getFunctionInputFromInputSchema } from 'twenty-shared/workflow';
import { Callout } from 'twenty-ui/components/feedback';
import { IconPlayerPlay, IconSettings } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const SETTINGS_TAB_ID: WorkflowMcpToolTabId = 'settings';
const TEST_TAB_ID: WorkflowMcpToolTabId = 'test';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledTabListContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  padding-left: ${themeCssVariables.spacing[2]};
`;

type WorkflowEditActionMcpToolProps = {
  action: WorkflowMcpToolAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowMcpToolAction) => void;
      };
};

export const WorkflowEditActionMcpTool = ({
  action,
  actionOptions,
}: WorkflowEditActionMcpToolProps) => {
  const { t } = useLingui();
  const { mcpServers, loading, error } = useFindManyMcpServers();
  const { settings, updateSettings, flushPendingSave } = useMcpToolStepForm({
    action,
    readonly: actionOptions.readonly,
    onActionUpdate: actionOptions.readonly
      ? undefined
      : actionOptions.onActionUpdate,
  });

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    WORKFLOW_MCP_TOOL_TAB_LIST_COMPONENT_ID,
  );
  const { openDialog } = useDialog();
  const testConfirmationDialogId = `mcp-tool-test-confirmation-${action.id}`;
  const { testMcpTool, isTesting, mcpToolTestData } = useTestMcpTool(action.id);

  const { mcpServerId, toolName } = settings.input;
  const mcpServer = mcpServers.find(
    (candidate) => candidate.id === mcpServerId,
  );
  const tool = mcpServer?.tools.find(
    (candidate) => candidate.name === toolName,
  );
  const inputSchema = isDefined(tool)
    ? jsonSchemaToInputSchema(tool.inputSchema)
    : undefined;
  const defaultToolInput = isDefined(inputSchema)
    ? getFunctionInputFromInputSchema(inputSchema)[0]
    : undefined;
  const toolInput = isObject(defaultToolInput)
    ? mergeDefaultFunctionInputAndFunctionInput({
        newInput: defaultToolInput,
        oldInput: settings.input.toolInput,
      })
    : settings.input.toolInput;

  const handleInputChange = (value: unknown, path: string[]) => {
    updateSettings({
      ...settings,
      input: {
        ...settings.input,
        toolInput: setNestedValue(toolInput, path, value),
      },
    });
  };

  const handleExpectedOutputBodyChange = (
    parsedValue: Record<string, unknown>,
  ) => {
    updateSettings({ ...settings, expectedOutputSchema: parsedValue });
  };

  const runTest = async () => {
    const testResult = await testMcpTool({ ...settings.input, toolInput });

    if (!isDefined(testResult) || isEmptyObject(testResult)) {
      return;
    }

    updateSettings({ ...settings, expectedOutputSchema: testResult });
    flushPendingSave();
  };

  const handleTestClick = async () => {
    if (actionOptions.readonly === true || !isDefined(tool)) {
      return;
    }

    if (!isMcpToolSafeToTestWithoutConfirmation(tool)) {
      openDialog(testConfirmationDialogId);

      return;
    }

    await runTest();
  };

  if (loading) {
    return null;
  }

  const hasInputFields = Object.keys(toolInput).length > 0;
  const hasTabs = actionOptions.readonly !== true;
  const isTestTabActive = hasTabs && activeTabId === TEST_TAB_ID;
  const mcpServerLabel = mcpServer?.label ?? '';

  const tabs = [
    { id: SETTINGS_TAB_ID, title: t`Settings`, Icon: IconSettings },
    { id: TEST_TAB_ID, title: t`Test`, Icon: IconPlayerPlay },
  ];

  const stepBody = (
    <WorkflowStepBody>
      {isTestTabActive ? (
        <StyledContainer>
          <McpToolTestVariableInput action={{ ...action, settings }} />
          <McpToolTestResult
            output={mcpToolTestData.output}
            isTesting={isTesting}
          />
        </StyledContainer>
      ) : (
        <StyledContainer>
          {isDefined(error) && (
            <Callout
              status="error"
              title={t`MCP servers unavailable`}
              description={t`The MCP servers could not be loaded, so this step cannot be edited right now.`}
            />
          )}
          {!isDefined(error) && !isDefined(tool) && (
            <Callout
              status="warning"
              title={t`Tool not found`}
              description={t`This tool is no longer offered by its MCP server. Sync the server tools or pick another tool.`}
            />
          )}
          {isDefined(tool) && hasInputFields && (
            <WorkflowEditActionCodeFields
              functionInput={toolInput}
              inputSchema={inputSchema}
              readonly={actionOptions.readonly}
              onInputChange={handleInputChange}
              VariablePicker={WorkflowVariablePicker}
              fullWidth
            />
          )}
          {isDefined(tool) && !hasInputFields && (
            <Callout
              status="neutral"
              title={t`No input fields for this tool`}
              description={t`The tool runs without arguments.`}
            />
          )}
          <McpToolExpectedOutputAdvancedSection
            expectedOutputSchema={settings.expectedOutputSchema}
            onChange={handleExpectedOutputBodyChange}
            readonly={actionOptions.readonly}
          />
        </StyledContainer>
      )}
    </WorkflowStepBody>
  );

  return (
    <TabListRoot
      componentInstanceId={WORKFLOW_MCP_TOOL_TAB_LIST_COMPONENT_ID}
      enabled={hasTabs}
    >
      {hasTabs && (
        <StyledTabListContainer>
          <TabList
            aria-label={t`MCP tool step`}
            tabs={tabs}
            behaveAsLinks={false}
            componentInstanceId={WORKFLOW_MCP_TOOL_TAB_LIST_COMPONENT_ID}
          />
        </StyledTabListContainer>
      )}
      {hasTabs ? (
        <WorkflowStepTabPanel value={activeTabId ?? ''}>
          {stepBody}
        </WorkflowStepTabPanel>
      ) : (
        stepBody
      )}
      {!actionOptions.readonly && (
        <WorkflowStepFooter
          stepId={action.id}
          additionalActions={
            isTestTabActive
              ? [
                  <WorkflowStepCmdEnterButton
                    key="test"
                    title={t`Test`}
                    onClick={handleTestClick}
                    disabled={isTesting || !isDefined(tool)}
                  />,
                ]
              : []
          }
        />
      )}
      <ConfirmationDialog
        dialogId={testConfirmationDialogId}
        title={t`Run this tool for real?`}
        subtitle={t`Testing calls ${toolName} on ${mcpServerLabel} with the current arguments. This tool is not marked as read-only, so it may create, change or delete data.`}
        onConfirmClick={runTest}
        confirmButtonText={t`Run tool`}
        confirmButtonColor="accent"
      />
    </TabListRoot>
  );
};
