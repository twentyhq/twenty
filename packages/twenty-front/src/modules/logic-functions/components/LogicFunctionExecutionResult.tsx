import { t } from '@lingui/core/macro';
import {
  type ExecutionStatus,
  WorkflowStepExecutionResult,
} from '@/workflow/components/WorkflowStepExecutionResult';
import { type LogicFunctionTestData } from '@/workflow/workflow-steps/workflow-actions/code-action/states/logicFunctionTestDataFamilyState';
import { LogicFunctionExecutionStatus } from '~/generated-metadata/graphql';

export const LogicFunctionExecutionResult = ({
  logicFunctionTestData,
  maxHeight,
  isTesting = false,
}: {
  logicFunctionTestData: LogicFunctionTestData;
  maxHeight?: number;
  isTesting?: boolean;
}) => {
  const result =
    logicFunctionTestData.output.data ||
    logicFunctionTestData.output.error ||
    '';

  const isSuccess =
    logicFunctionTestData.output.status ===
    LogicFunctionExecutionStatus.SUCCESS;

  const isError =
    logicFunctionTestData.output.status === LogicFunctionExecutionStatus.ERROR;

  const duration = logicFunctionTestData.output.duration;
  const status: ExecutionStatus = {
    isSuccess,
    isError,
    successMessage: isSuccess ? t`200 OK - ${duration}ms` : undefined,
    errorMessage: isError ? t`500 Error - ${duration}ms` : undefined,
  };

  return (
    <WorkflowStepExecutionResult
      result={result}
      language={logicFunctionTestData.language}
      height={Math.min(
        logicFunctionTestData.height,
        maxHeight ?? logicFunctionTestData.height,
      )}
      status={status}
      isTesting={isTesting}
      loadingMessage={t`Running function`}
      idleMessage={t`Output`}
    />
  );
};
