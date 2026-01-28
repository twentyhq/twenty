import { useExecuteOneLogicFunction } from '@/settings/logic-functions/hooks/useExecuteOneLogicFunction';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { sleep } from '~/utils/sleep';

export const useTestLogicFunction = ({
  logicFunctionId,
  callback,
}: {
  logicFunctionId: string;
  callback?: (testResult: object) => void;
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const { executeOneLogicFunction } = useExecuteOneLogicFunction();
  const [logicFunctionTestData, setLogicFunctionTestData] = useRecoilState(
    logicFunctionTestDataFamilyState(logicFunctionId),
  );

  const testLogicFunction = async () => {
    try {
      setIsTesting(true);
      await sleep(200); // Delay artificially to avoid flashing the UI
      const result = await executeOneLogicFunction({
        id: logicFunctionId,
        payload: logicFunctionTestData.input,
        version: 'draft',
      });

      setIsTesting(false);

      if (isDefined(result?.data?.executeOneLogicFunction?.data)) {
        callback?.(result?.data?.executeOneLogicFunction?.data);
      }

      setLogicFunctionTestData((prev) => ({
        ...prev,
        language: 'json',
        height: 300,
        output: {
          data: result?.data?.executeOneLogicFunction?.data
            ? JSON.stringify(
                result?.data?.executeOneLogicFunction?.data,
                null,
                4,
              )
            : undefined,
          logs: result?.data?.executeOneLogicFunction?.logs || '',
          duration: result?.data?.executeOneLogicFunction?.duration,
          status: result?.data?.executeOneLogicFunction?.status,
          error: result?.data?.executeOneLogicFunction?.error
            ? JSON.stringify(
                result?.data?.executeOneLogicFunction?.error,
                null,
                4,
              )
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
