import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { logicFunctionTestDataFamilyState } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import {
  LogicFunctionExecutionStatus,
  TestWorkflowCodeStepDocument,
} from '~/generated/graphql';
import { sleep } from '~/utils/sleep';

export const useTestWorkflowCodeStep = ({ stepId }: { stepId: string }) => {
  const apolloCoreClient = useApolloCoreClient();
  const [isTesting, setIsTesting] = useState(false);
  const [testWorkflowCodeStepMutation] = useMutation(
    TestWorkflowCodeStepDocument,
    { client: apolloCoreClient },
  );

  const logicFunctionTestData = useAtomFamilyStateValue(
    logicFunctionTestDataFamilyState,
    stepId,
  );

  const setLogicFunctionTestData = useSetAtomFamilyState(
    logicFunctionTestDataFamilyState,
    stepId,
  );

  const updateLogicFunctionTestInput = (input: object) => {
    setLogicFunctionTestData((previousTestData) => ({
      ...previousTestData,
      input,
    }));
  };

  const testWorkflowCodeStep = async ({
    workflowVersionId,
    code,
  }: {
    workflowVersionId: string;
    code: string;
  }): Promise<object | undefined> => {
    if (isTesting) {
      return undefined;
    }

    setIsTesting(true);

    try {
      await sleep(200); // Delay artificially to avoid flashing the UI

      const result = await testWorkflowCodeStepMutation({
        variables: {
          input: {
            workflowVersionId,
            code,
            payload: logicFunctionTestData.input,
          },
        },
      });

      const executionResult = result.data?.testWorkflowCodeStep;
      const executionData = executionResult?.data;

      setLogicFunctionTestData((previousTestData) => ({
        ...previousTestData,
        language: 'json',
        output: {
          data: isDefined(executionData)
            ? JSON.stringify(executionData, null, 4)
            : undefined,
          logs: executionResult?.logs ?? '',
          duration: executionResult?.duration,
          status: executionResult?.status ?? LogicFunctionExecutionStatus.IDLE,
          error: isDefined(executionResult?.error)
            ? JSON.stringify(executionResult?.error, null, 4)
            : undefined,
        },
      }));

      return executionData ?? undefined;
    } catch (error) {
      setLogicFunctionTestData((previousTestData) => ({
        ...previousTestData,
        language: 'json',
        output: {
          data: undefined,
          logs: '',
          duration: undefined,
          status: LogicFunctionExecutionStatus.ERROR,
          error: JSON.stringify(
            {
              errorType:
                error instanceof Error ? error.name : doNotTranslate('Error'),
              errorMessage:
                error instanceof Error ? error.message : String(error),
            },
            null,
            4,
          ),
        },
      }));

      return undefined;
    } finally {
      setIsTesting(false);
    }
  };

  return {
    testWorkflowCodeStep,
    updateLogicFunctionTestInput,
    logicFunctionTestData,
    isTesting,
  };
};
