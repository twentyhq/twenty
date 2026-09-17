import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { type CallToolResult } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';

import { CALL_TOOL } from '@/ai/graphql/mutations/callTool';
import {
  type CallToolMutation,
  type CallToolMutationVariables,
} from '~/generated-metadata/graphql';

export const useCallTool = () => {
  const [callToolMutation] = useMutation<
    CallToolMutation,
    CallToolMutationVariables
  >(CALL_TOOL);

  const callTool = useCallback(
    async (
      toolName: string,
      input?: Record<string, unknown>,
    ): Promise<CallToolResult> => {
      try {
        const { data } = await callToolMutation({
          variables: { toolName, input },
        });

        const result = data?.callTool;

        if (!isDefined(result)) {
          return {
            success: false,
            message: 'The tool returned no result',
            error: 'EMPTY_RESULT',
          };
        }

        return {
          success: result.success,
          message: result.message,
          error: result.error ?? undefined,
          result: (result.result as Record<string, unknown>) ?? undefined,
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'The tool failed',
          error: 'CALL_FAILED',
        };
      }
    },
    [callToolMutation],
  );

  return { callTool };
};
