import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { BUILD_AND_EXECUTE_ONE_LOGIC_FUNCTION } from '@/logic-functions/graphql/mutations/buildAndExecuteOneLogicFunction';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { LogicFunctionExecutionStatus } from '~/generated-metadata/graphql';
import { sleep } from '~/utils/sleep';

type BuildAndExecuteOneLogicFunctionInput = {
  id: string;
  payload: object;
};

type BuildAndExecuteOneLogicFunctionResult = {
  data?: object | null;
  logs: string;
  duration: number;
  status: LogicFunctionExecutionStatus;
  error?: {
    errorType: string;
    errorMessage: string;
    stackTrace: string;
  } | null;
};

export const useBuildAndExecuteLogicFunction = ({
  logicFunctionId,
  callback,
}: {
  logicFunctionId: string;
  callback?: (testResult: object) => void;
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const apolloMetadataClient = useApolloCoreClient();
  const [buildAndExecuteOneLogicFunctionMutation] = useMutation<
    { buildAndExecuteOneLogicFunction: BuildAndExecuteOneLogicFunctionResult },
    { input: BuildAndExecuteOneLogicFunctionInput }
  >(BUILD_AND_EXECUTE_ONE_LOGIC_FUNCTION, {
    client: apolloMetadataClient,
  });

  const [logicFunctionTestData, setLogicFunctionTestData] = useRecoilState(
    logicFunctionTestDataFamilyState(logicFunctionId),
  );

  const buildAndExecuteLogicFunction = async () => {
    try {
      setIsExecuting(true);
      await sleep(200); // Delay artificially to avoid flashing the UI
      const result = await buildAndExecuteOneLogicFunctionMutation({
        variables: {
          input: {
            id: logicFunctionId,
            payload: logicFunctionTestData.input,
          },
        },
      });

      setIsExecuting(false);

      const executionResult =
        result?.data?.buildAndExecuteOneLogicFunction;

      if (isDefined(executionResult?.data)) {
        callback?.(executionResult.data);
      }

      setLogicFunctionTestData((prev) => ({
        ...prev,
        language: 'json',
        height: 300,
        output: {
          data: executionResult?.data
            ? JSON.stringify(executionResult.data, null, 4)
            : undefined,
          logs: executionResult?.logs || '',
          duration: executionResult?.duration,
          status: (executionResult?.status ??
            LogicFunctionExecutionStatus.IDLE) as LogicFunctionExecutionStatus,
          error: executionResult?.error
            ? JSON.stringify(executionResult.error, null, 4)
            : undefined,
        },
      }));
    } catch (error) {
      setIsExecuting(false);
      throw error;
    }
  };

  return { buildAndExecuteLogicFunction, isExecuting };
};
