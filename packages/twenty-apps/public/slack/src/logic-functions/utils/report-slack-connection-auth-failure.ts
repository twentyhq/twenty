import { reportConnectionAuthFailure } from 'twenty-sdk/logic-function';

import { SLACK_CONNECTION_AUTH_FAILURE_REPORT_TIMEOUT_MS } from 'src/logic-functions/constants/slack-connection-auth-failure-report-timeout-ms';

// The platform call is advisory, so it must never outlive the work that
// triggered it: a slow report would eat the caller's remaining budget
export const reportSlackConnectionAuthFailure = async ({
  connectionId,
  reason,
}: {
  connectionId: string;
  reason: string;
}): Promise<void> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const reportPromise = reportConnectionAuthFailure({
    connectionId,
    reason,
  }).catch(() => undefined);

  const timeoutPromise = new Promise<void>((resolve) => {
    timeoutId = setTimeout(
      resolve,
      SLACK_CONNECTION_AUTH_FAILURE_REPORT_TIMEOUT_MS,
    );
  });

  try {
    await Promise.race([reportPromise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};
