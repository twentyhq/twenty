import { useFindManyMcpServers } from '@/mcp-servers/hooks/useFindManyMcpServers';
import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { WorkflowExpectedOutputBodyInput } from '@/workflow/workflow-steps/components/WorkflowExpectedOutputBodyInput';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/mergeDefaultFunctionInputAndFunctionInput';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';
import { useMcpToolStepForm } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/hooks/useMcpToolStepForm';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isObject } from '@sniptt/guards';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { getFunctionInputFromInputSchema } from 'twenty-shared/workflow';
import { Callout } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
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
  const { settings, updateSettings } = useMcpToolStepForm({
    action,
    readonly: actionOptions.readonly,
    onActionUpdate: actionOptions.readonly
      ? undefined
      : actionOptions.onActionUpdate,
  });

  const { mcpServerId, toolName } = settings.input;
  const tool = mcpServers
    .find((mcpServer) => mcpServer.id === mcpServerId)
    ?.tools.find((candidate) => candidate.name === toolName);
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

  if (loading) {
    return null;
  }

  const hasInputFields = Object.keys(toolInput).length > 0;

  return (
    <>
      <WorkflowStepBody>
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
          <WorkflowExpectedOutputBodyInput
            defaultValue={settings.expectedOutputSchema}
            onChange={handleExpectedOutputBodyChange}
            readonly={actionOptions.readonly}
          />
        </StyledContainer>
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
