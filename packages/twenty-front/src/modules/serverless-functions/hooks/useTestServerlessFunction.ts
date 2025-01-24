import { useExecuteOneServerlessFunction } from '@/settings/serverless-functions/hooks/useExecuteOneServerlessFunction';
import { useRecoilState } from 'recoil';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { isDefined } from 'twenty-ui';

export const useTestServerlessFunction = ({
  serverlessFunctionId,
  serverlessFunctionVersion = 'draft',
  callback,
}: {
  serverlessFunctionId: string;
  serverlessFunctionVersion?: string;
  callback?: (testResult: object) => void;
}) => {
  const { executeOneServerlessFunction } = useExecuteOneServerlessFunction();
  const [serverlessFunctionTestData, setServerlessFunctionTestData] =
    useRecoilState(serverlessFunctionTestDataFamilyState(serverlessFunctionId));

  const testServerlessFunction = async () => {
    const result = await executeOneServerlessFunction({
      id: serverlessFunctionId,
      payload: serverlessFunctionTestData.input,
      version: serverlessFunctionVersion,
    });

    if (isDefined(result?.data?.executeOneServerlessFunction?.data)) {
      callback?.(result?.data?.executeOneServerlessFunction?.data);
    }

    setServerlessFunctionTestData((prev) => ({
      ...prev,
      language: 'json',
      height: 300,
      output: {
        data: result?.data?.executeOneServerlessFunction?.data
          ? JSON.stringify(
              result?.data?.executeOneServerlessFunction?.data,
              null,
              4,
            )
          : undefined,
        duration: result?.data?.executeOneServerlessFunction?.duration,
        status: result?.data?.executeOneServerlessFunction?.status,
        error: result?.data?.executeOneServerlessFunction?.error
          ? JSON.stringify(
              result?.data?.executeOneServerlessFunction?.error,
              null,
              4,
            )
          : undefined,
      },
    }));
  };

  return { testServerlessFunction };
};
