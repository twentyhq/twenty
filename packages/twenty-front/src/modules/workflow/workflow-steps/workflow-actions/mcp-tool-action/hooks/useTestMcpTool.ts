import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { TEST_MCP_TOOL_STEP } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/graphql/mutations/testMcpToolStep';
import { mcpToolTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/states/mcpToolTestDataFamilyState';
import { type McpToolTestData } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/types/McpToolTestData';
import { resolveMcpToolTestArgumentsOrThrow } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/utils/resolveMcpToolTestArgumentsOrThrow';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useState } from 'react';
import { type JsonObject } from 'type-fest';
import {
  type TestMcpToolStepMutation,
  type TestMcpToolStepMutationVariables,
} from '~/generated/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useTestMcpTool = (actionId: string) => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();
  const [isTesting, setIsTesting] = useState(false);
  const store = useStore();
  const scopeId = useRoutedFlowStateScopeId();
  const mcpToolTestDataAtom = mcpToolTestDataFamilyState.getAtom(
    actionId,
    scopeId,
  );
  const mcpToolTestData = useAtomFamilyStateValue(
    mcpToolTestDataFamilyState,
    actionId,
  );
  const setMcpToolTestData = useSetAtomFamilyState(
    mcpToolTestDataFamilyState,
    actionId,
  );
  const [testMcpToolStep] = useMutation<
    TestMcpToolStepMutation,
    TestMcpToolStepMutationVariables
  >(TEST_MCP_TOOL_STEP, { client: apolloCoreClient });

  const setOutput = (output: McpToolTestData['output']) => {
    setMcpToolTestData((previousTestData) => ({ ...previousTestData, output }));
  };

  const testMcpTool = async ({
    workflowVersionId,
    mcpServerId,
    toolName,
    toolInput,
    isDestructiveToolConfirmed,
  }: WorkflowMcpToolAction['settings']['input'] & {
    workflowVersionId: string;
    isDestructiveToolConfirmed: boolean;
  }): Promise<JsonObject | undefined> => {
    setIsTesting(true);

    try {
      const { data } = await testMcpToolStep({
        variables: {
          input: {
            workflowVersionId,
            mcpServerId,
            toolName,
            toolArguments: resolveMcpToolTestArgumentsOrThrow({
              toolInput,
              variableValues: store.get(mcpToolTestDataAtom).variableValues,
            }),
            isDestructiveToolConfirmed,
          },
        },
      });

      const testResult = data?.testMcpToolStep;

      if (!testResult?.success) {
        setOutput({
          status: 'error',
          error: testResult?.error ?? t`The tool call failed`,
        });

        return undefined;
      }

      const result: JsonObject = testResult.result ?? {};

      setOutput({ status: 'success', result });

      return result;
    } catch (error) {
      setOutput({
        status: 'error',
        error:
          error instanceof Error
            ? getErrorMessageFromApolloError(error)
            : t`The tool call failed`,
      });

      return undefined;
    } finally {
      setIsTesting(false);
    }
  };

  return { testMcpTool, isTesting, mcpToolTestData };
};
