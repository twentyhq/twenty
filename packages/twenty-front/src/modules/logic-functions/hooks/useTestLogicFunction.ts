import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { TEST_LOGIC_FUNCTION } from '@/logic-functions/graphql/mutations/testLogicFunction';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { LogicFunctionExecutionStatus } from '~/generated-metadata/graphql';
import { sleep } from '~/utils/sleep';

type TestLogicFunctionInput = {
  id: string;
  payload: object;
};

type TestLogicFunctionResult = {
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

export const useTestLogicFunction = ({
  logicFunctionId,
  callback,
}: {
  logicFunctionId: string;
  callback?: (testResult: object) => void;
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const apolloMetadataClient = useApolloCoreClient();
  const [testLogicFunctionMutation] = useMutation<
    { testLogicFunction: TestLogicFunctionResult },
    { input: TestLogicFunctionInput }
  >(TEST_LOGIC_FUNCTION, {
    client: apolloMetadataClient,
  });

  const [logicFunctionTestData, setLogicFunctionTestData] = useRecoilState(
    logicFunctionTestDataFamilyState(logicFunctionId),
  );

  const testLogicFunction = async () => {
    try {
      setIsTesting(true);
      await sleep(200); // Delay artificially to avoid flashing the UI
      const result = await testLogicFunctionMutation({
        variables: {
          input: {
            id: logicFunctionId,
            payload: logicFunctionTestData.input,
          },
        },
      });

      setIsTesting(false);

      const testLogicFunctionResult = result?.data?.testLogicFunction;

      if (isDefined(testLogicFunctionResult?.data)) {
        callback?.(testLogicFunctionResult.data);
      }

      setLogicFunctionTestData((prev) => ({
        ...prev,
        language: 'json',
        height: 300,
        output: {
          data: testLogicFunctionResult?.data
            ? JSON.stringify(testLogicFunctionResult.data, null, 4)
            : undefined,
          logs: testLogicFunctionResult?.logs || '',
          duration: testLogicFunctionResult?.duration,
          status: (testLogicFunctionResult?.status ??
            LogicFunctionExecutionStatus.IDLE) as LogicFunctionExecutionStatus,
          error: testLogicFunctionResult?.error
            ? JSON.stringify(testLogicFunctionResult.error, null, 4)
            : undefined,
        },
      }));
    } catch (error) {
      setIsTesting(false);
      throw error;
    }
  };

  return { testLogicFunction, isTesting };
};
