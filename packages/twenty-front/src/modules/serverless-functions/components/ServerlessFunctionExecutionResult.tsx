import { t } from '@lingui/core/macro';
import {
  type ExecutionStatus,
  WorkflowStepExecutionResult,
} from '@/workflow/components/WorkflowStepExecutionResult';
import { type ServerlessFunctionTestData } from '@/workflow/workflow-steps/workflow-actions/code-action/states/serverlessFunctionTestDataFamilyState';
import { ServerlessFunctionExecutionStatus } from '~/generated-metadata/graphql';

export const ServerlessFunctionExecutionResult = ({
  serverlessFunctionTestData,
  maxHeight,
  isTesting = false,
}: {
  serverlessFunctionTestData: ServerlessFunctionTestData;
  maxHeight?: number;
  isTesting?: boolean;
}) => {
  const result =
    serverlessFunctionTestData.output.data ||
    serverlessFunctionTestData.output.error ||
    '';

  const isSuccess =
    serverlessFunctionTestData.output.status ===
    ServerlessFunctionExecutionStatus.SUCCESS;

  const isError =
    serverlessFunctionTestData.output.status ===
    ServerlessFunctionExecutionStatus.ERROR;

  const duration = serverlessFunctionTestData.output.duration;
  const status: ExecutionStatus = {
    isSuccess,
    isError,
    successMessage: isSuccess ? t`200 OK - ${duration}ms` : undefined,
    errorMessage: isError ? t`500 Error - ${duration}ms` : undefined,
  };

  return (
    <WorkflowStepExecutionResult
      result={result}
      language={serverlessFunctionTestData.language}
      height={Math.min(
        serverlessFunctionTestData.height,
        maxHeight ?? serverlessFunctionTestData.height,
      )}
      status={status}
      isTesting={isTesting}
      loadingMessage={t`Running function`}
      idleMessage={t`Output`}
    />
  );
};
