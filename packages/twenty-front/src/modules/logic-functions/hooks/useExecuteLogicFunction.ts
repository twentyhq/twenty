import { EXECUTE_ONE_LOGIC_FUNCTION } from '@/logic-functions/graphql/mutations/executeOneLogicFunction';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { LogicFunctionExecutionStatus } from '~/generated-metadata/graphql';
import { sleep } from '~/utils/sleep';

type ExecuteOneLogicFunctionInput = {
  id: string;
  payload: object;
};

type ExecuteOneLogicFunctionResult = {
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

export const useExecuteLogicFunction = ({
  logicFunctionId,
  callback,
}: {
  logicFunctionId: string;
  callback?: (result: object) => void;
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeOneLogicFunctionMutation] = useMutation<
    { executeOneLogicFunction: ExecuteOneLogicFunctionResult },
    { input: ExecuteOneLogicFunctionInput }
  >(EXECUTE_ONE_LOGIC_FUNCTION);

  const [logicFunctionTestData, setLogicFunctionTestData] = useRecoilState(
    logicFunctionTestDataFamilyState(logicFunctionId),
  );

  const executeLogicFunction = async () => {
    try {
      setIsExecuting(true);
      await sleep(200); // Delay artificially to avoid flashing the UI
      const result = await executeOneLogicFunctionMutation({
        variables: {
          input: {
            id: logicFunctionId,
            payload: logicFunctionTestData.input,
          },
        },
      });

      setIsExecuting(false);

      const executionResult = result?.data?.executeOneLogicFunction;

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

  return { executeLogicFunction, isExecuting };
};
