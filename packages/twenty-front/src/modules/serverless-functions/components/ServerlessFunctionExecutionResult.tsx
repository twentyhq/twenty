import {
  ExecutionStatus,
  WorkflowExecutionResult,
} from '@/workflow/components/WorkflowExecutionResult';
import { ServerlessFunctionTestData } from '@/workflow/states/serverlessFunctionTestDataFamilyState';
import { ServerlessFunctionExecutionStatus } from '~/generated-metadata/graphql';

export const ServerlessFunctionExecutionResult = ({
  serverlessFunctionTestData,
  isTesting = false,
}: {
  serverlessFunctionTestData: ServerlessFunctionTestData;
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

  const status: ExecutionStatus = {
    isSuccess,
    isError,
    successMessage: isSuccess
      ? `200 OK - ${serverlessFunctionTestData.output.duration}ms`
      : undefined,
    errorMessage: isError
      ? `500 Error - ${serverlessFunctionTestData.output.duration}ms`
      : undefined,
  };

  return (
    <WorkflowExecutionResult
      result={result}
      language={serverlessFunctionTestData.language}
      height={serverlessFunctionTestData.height}
      status={status}
      isTesting={isTesting}
      loadingMessage="Running function"
      idleMessage="Output"
    />
  );
};
