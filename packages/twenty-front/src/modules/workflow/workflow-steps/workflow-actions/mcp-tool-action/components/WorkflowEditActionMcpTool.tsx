import { useFindManyMcpServers } from '@/mcp-servers/hooks/useFindManyMcpServers';
import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { WorkflowExpectedOutputBodyInput } from '@/workflow/workflow-steps/components/WorkflowExpectedOutputBodyInput';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowEditActionCodeFields } from '@/workflow/workflow-steps/workflow-actions/code-action/components/WorkflowEditActionCodeFields';
import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/mergeDefaultFunctionInputAndFunctionInput';
import { setNestedValue } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/setNestedValue';
import { getMcpToolInputSchema } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/utils/getMcpToolInputSchema';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isObject } from '@sniptt/guards';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { getFunctionInputFromInputSchema } from 'twenty-shared/workflow';
import { Callout } from 'twenty-ui/components/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';

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
  const { mcpServerId, toolName } = action.settings.input;
  const { mcpServers, loading } = useFindManyMcpServers();

  const mcpServer = mcpServers.find((server) => server.id === mcpServerId);
  const tool = mcpServer?.tools.find((candidate) => candidate.name === toolName);
  const inputSchema = getMcpToolInputSchema(tool?.inputSchema);

  const toolInput = useMemo(() => {
    const storedInput = action.settings.input.toolInput ?? {};

    if (!isDefined(inputSchema)) {
      return storedInput;
    }

    const defaultInput = getFunctionInputFromInputSchema(inputSchema)[0];

    return isObject(defaultInput)
      ? mergeDefaultFunctionInputAndFunctionInput({
          newInput: defaultInput,
          oldInput: storedInput,
        })
      : storedInput;
  }, [inputSchema, action.settings.input.toolInput]);

  const updateAction = useDebouncedCallback(
    (settings: WorkflowMcpToolAction['settings']) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({ ...action, settings });
    },
    500,
  );

  const handleInputChange = (value: unknown, path: string[]) => {
    updateAction({
      ...action.settings,
      input: {
        ...action.settings.input,
        toolInput: setNestedValue(toolInput, path, value),
      },
    });
  };

  const handleExpectedOutputBodyChange = (
    parsedValue: Record<string, unknown>,
  ) => {
    updateAction({ ...action.settings, expectedOutputSchema: parsedValue });
  };

  if (loading) {
    return null;
  }

  const hasInputFields = Object.keys(toolInput).length > 0;

  return (
    <>
      <WorkflowStepBody>
        <StyledContainer>
          {!isDefined(tool) ? (
            <Callout
              status="warning"
              title={t`Tool not found`}
              description={t`This tool is no longer offered by its MCP server. Sync the server tools or pick another tool.`}
            />
          ) : hasInputFields ? (
            <WorkflowEditActionCodeFields
              functionInput={toolInput}
              inputSchema={inputSchema}
              readonly={actionOptions.readonly}
              onInputChange={handleInputChange}
              VariablePicker={WorkflowVariablePicker}
              fullWidth
            />
          ) : (
            <Callout
              status="neutral"
              title={t`No input fields for this tool`}
              description={t`The tool runs without arguments.`}
            />
          )}
          <WorkflowExpectedOutputBodyInput
            defaultValue={action.settings.expectedOutputSchema}
            onChange={handleExpectedOutputBodyChange}
            readonly={actionOptions.readonly}
          />
        </StyledContainer>
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
