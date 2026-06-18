import {
  EXECUTOR_LAMBDA_INVOKE_ABORT_GRACE_PERIOD_MS,
  EXECUTOR_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';

// AbortSignal.timeout starts counting at send() time, so it also covers the
// request round-trip and any cold-start init — neither of which counts against
// the Lambda's own timeout. Below the executor Lambda's hard limit the client
// abort is the only thing enforcing the function's configured timeout, so honor
// it exactly. At/above the limit the Lambda enforces the timeout itself, so add
// grace to let its own "Task timed out" result win the race against the abort.
export const computeLambdaInvokeAbortTimeoutMs = (
  requestedTimeoutMs: number,
): number => {
  const lambdaHardTimeoutMs = EXECUTOR_LAMBDA_TIMEOUT_SECONDS * 1_000;

  if (requestedTimeoutMs < lambdaHardTimeoutMs) {
    return requestedTimeoutMs;
  }

  return lambdaHardTimeoutMs + EXECUTOR_LAMBDA_INVOKE_ABORT_GRACE_PERIOD_MS;
};
