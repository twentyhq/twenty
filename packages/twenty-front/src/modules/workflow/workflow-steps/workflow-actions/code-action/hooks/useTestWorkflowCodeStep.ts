import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { EXECUTE_CODE_STEP } from '@/workflow/graphql/mutations/executeCodeStep';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { LogicFunctionExecutionStatus } from '~/generated-metadata/graphql';
import { sleep } from '~/utils/sleep';

type ExecuteCodeStepInput = {
  logicFunctionId: string;
  payload: object;
};

type ExecuteCodeStepResult = {
  data?: object | null;
  logs: string;
  duration: number;
  status: LogicFunctionExecutionStatus;
  error?: { errorType: string; errorMessage: string; stackTrace: string } | null;
};

export const useTestWorkflowCodeStep = ({
  logicFunctionId,
  callback,
}: {
  logicFunctionId: string;
  callback?: (testResult: object) => void;
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const apolloMetadataClient = useApolloCoreClient();
  const [executeCodeStepMutation] = useMutation<
    { executeCodeStep: ExecuteCodeStepResult },
    { input: ExecuteCodeStepInput }
  >(EXECUTE_CODE_STEP, {
    client: apolloMetadataClient,
  });

  const [logicFunctionTestData, setLogicFunctionTestData] = useRecoilState(
    logicFunctionTestDataFamilyState(logicFunctionId),
  );

  const testWorkflowCodeStep = async () => {
    try {
      setIsTesting(true);
      await sleep(200);
      const result = await executeCodeStepMutation({
        variables: {
          input: {
            logicFunctionId,
            payload: logicFunctionTestData.input,
          },
        },
      });

      setIsTesting(false);

      const executeCodeStep = result?.data?.executeCodeStep;

      if (isDefined(executeCodeStep?.data)) {
        callback?.(executeCodeStep.data);
      }

      setLogicFunctionTestData((prev) => ({
        ...prev,
        language: 'json',
        height: 300,
        output: {
          data: executeCodeStep?.data
            ? JSON.stringify(executeCodeStep.data, null, 4)
            : undefined,
          logs: executeCodeStep?.logs || '',
          duration: executeCodeStep?.duration,
          status: (executeCodeStep?.status ??
            LogicFunctionExecutionStatus.IDLE) as LogicFunctionExecutionStatus,
          error: executeCodeStep?.error
            ? JSON.stringify(executeCodeStep.error, null, 4)
            : undefined,
        },
      }));
    } catch (error) {
      setIsTesting(false);
      throw error;
    }
  };

  return { testLogicFunction: testWorkflowCodeStep, isTesting };
};
