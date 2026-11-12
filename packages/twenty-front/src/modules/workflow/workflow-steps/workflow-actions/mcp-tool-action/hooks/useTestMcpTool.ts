import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { type WorkflowMcpToolAction } from '@/workflow/types/Workflow';
import { TEST_MCP_TOOL_STEP } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/graphql/mutations/testMcpToolStep';
import { mcpToolTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/states/mcpToolTestDataFamilyState';
import { type McpToolTestData } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/types/McpToolTestData';
import { resolveMcpToolTestArguments } from '@/workflow/workflow-steps/workflow-actions/mcp-tool-action/utils/resolveMcpToolTestArguments';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
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
    mcpServerId,
    toolName,
    toolInput,
  }: WorkflowMcpToolAction['settings']['input']): Promise<
    JsonObject | undefined
  > => {
    if (isTesting) {
      return undefined;
    }

    setIsTesting(true);

    try {
      const { data } = await testMcpToolStep({
        variables: {
          input: {
            mcpServerId,
            toolName,
            toolArguments: resolveMcpToolTestArguments({
              toolInput,
              variableValues: mcpToolTestData.variableValues,
            }),
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
