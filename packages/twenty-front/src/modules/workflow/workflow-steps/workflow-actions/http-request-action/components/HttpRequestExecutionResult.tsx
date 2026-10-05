import {
  type ExecutionStatus,
  WorkflowStepExecutionResult,
} from '@/workflow/components/WorkflowStepExecutionResult';
import type { HttpRequestTestData } from '@/workflow/workflow-steps/workflow-actions/http-request-action/types/HttpRequestTestData';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

export const HttpRequestExecutionResult = ({
  httpRequestTestData,
  isTesting = false,
}: {
  httpRequestTestData: HttpRequestTestData;
  isTesting?: boolean;
}) => {
  const { t } = useLingui();

  const hasTestOutput =
    isDefined(httpRequestTestData.output.data) ||
    isDefined(httpRequestTestData.output.error);

  const result = hasTestOutput
    ? httpRequestTestData.output.data || httpRequestTestData.output.error || ''
    : t`Configure your request above, then press "Test"`;

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
