import {
  EXECUTOR_LAMBDA_INVOKE_ABORT_GRACE_PERIOD_MS,
  EXECUTOR_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { computeLambdaInvokeAbortTimeoutMs } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/compute-lambda-invoke-abort-timeout-ms.util';

describe('computeLambdaInvokeAbortTimeoutMs', () => {
  const lambdaHardTimeoutMs = EXECUTOR_LAMBDA_TIMEOUT_SECONDS * 1_000;

  it('returns the requested timeout untouched when below the Lambda hard limit', () => {
    expect(computeLambdaInvokeAbortTimeoutMs(30_000)).toBe(30_000);
    expect(computeLambdaInvokeAbortTimeoutMs(lambdaHardTimeoutMs - 1)).toBe(
      lambdaHardTimeoutMs - 1,
    );
  });

  it('adds the grace period when the requested timeout reaches the Lambda hard limit', () => {
    // Regression: a function with timeoutSeconds === EXECUTOR_LAMBDA_TIMEOUT_SECONDS
    // must let the Lambda's own timeout fire first instead of the client aborting
    // mid-flight and surfacing a confusing client-side TimeoutError.
    expect(computeLambdaInvokeAbortTimeoutMs(lambdaHardTimeoutMs)).toBe(
      lambdaHardTimeoutMs + EXECUTOR_LAMBDA_INVOKE_ABORT_GRACE_PERIOD_MS,
    );
  });

  it('caps the abort at the Lambda hard limit plus grace when the requested timeout exceeds it', () => {
    expect(
      computeLambdaInvokeAbortTimeoutMs(lambdaHardTimeoutMs + 60_000),
    ).toBe(lambdaHardTimeoutMs + EXECUTOR_LAMBDA_INVOKE_ABORT_GRACE_PERIOD_MS);
  });
});
