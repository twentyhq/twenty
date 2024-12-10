import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useExecuteOneServerlessFunction } from '@/settings/serverless-functions/hooks/useExecuteOneServerlessFunction';
import { useRecoilState } from 'recoil';
import { serverlessFunctionTestDataFamilyState } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from 'twenty-ui';

export const useTestServerlessFunction = (
  serverlessFunctionId: string,
  callback?: (testResult: object) => Promise<void>,
) => {
  const { enqueueSnackBar } = useSnackBar();
  const { executeOneServerlessFunction } = useExecuteOneServerlessFunction();
  const [serverlessFunctionTestData, setServerlessFunctionTestData] =
    useRecoilState(serverlessFunctionTestDataFamilyState(serverlessFunctionId));

  const testServerlessFunction = async () => {
    try {
      const result = await executeOneServerlessFunction({
        id: serverlessFunctionId,
        payload: serverlessFunctionTestData.input,
        version: 'draft',
      });

      if (isDefined(result?.data?.executeOneServerlessFunction?.data)) {
        await callback?.(result?.data?.executeOneServerlessFunction?.data);
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
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while executing function',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };

  return { testServerlessFunction };
};
