import {
  ExecutionStatus,
  WorkflowExecutionResult,
} from '@/workflow/components/WorkflowExecutionResult';
import type { HttpRequestTestData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/types/HttpRequestTestData';

export const HttpRequestExecutionResult = ({
  httpRequestTestData,
  isTesting = false,
}: {
  httpRequestTestData: HttpRequestTestData;
  isTesting?: boolean;
}) => {
  const result =
    httpRequestTestData.output.data || httpRequestTestData.output.error || '';

  const isSuccess =
    httpRequestTestData.output.status !== undefined &&
    httpRequestTestData.output.status >= 200 &&
    httpRequestTestData.output.status < 400;

  const isError =
    httpRequestTestData.output.error !== undefined ||
    (httpRequestTestData.output.status !== undefined &&
      httpRequestTestData.output.status >= 400);

  const status: ExecutionStatus = {
    isSuccess,
    isError,
    successMessage: httpRequestTestData.output.status
      ? `${httpRequestTestData.output.status} ${httpRequestTestData.output.statusText}${
          httpRequestTestData.output.duration
            ? ` - ${httpRequestTestData.output.duration}ms`
            : ''
        }`
      : undefined,
    errorMessage: httpRequestTestData.output.status
      ? `${httpRequestTestData.output.status} ${httpRequestTestData.output.statusText}${
          httpRequestTestData.output.duration
            ? ` - ${httpRequestTestData.output.duration}ms`
            : ''
        }`
      : 'Request Failed',
    additionalInfo:
      isSuccess &&
      Object.keys(httpRequestTestData.output.headers || {}).length > 0
        ? `${Object.keys(httpRequestTestData.output.headers || {}).length} headers received`
        : isError && httpRequestTestData.output.error
          ? httpRequestTestData.output.error
          : undefined,
  };

  return (
    <WorkflowExecutionResult
      result={result}
      language={httpRequestTestData.language}
      height="100%"
      status={status}
      isTesting={isTesting}
      loadingMessage="Sending request..."
      idleMessage="Response"
    />
  );
};
