import {
  type ExecutionStatus,
  WorkflowStepExecutionResult,
} from '@/workflow/components/WorkflowStepExecutionResult';
import type { HttpRequestTestData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/types/HttpRequestTestData';
import { t } from '@lingui/core/macro';

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

  const headersCount = Object.keys(
    httpRequestTestData.output.headers || {},
  ).length;

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
      : t`Request Failed`,
    additionalInfo:
      isSuccess && headersCount > 0
        ? t`${headersCount} headers received`
        : isError
          ? t`An error occurred`
          : undefined,
  };

  return (
    <WorkflowStepExecutionResult
      result={result}
      language={httpRequestTestData.language}
      height="100%"
      status={status}
      isTesting={isTesting}
      loadingMessage={t`Sending request...`}
      idleMessage={t`Response`}
    />
  );
};
