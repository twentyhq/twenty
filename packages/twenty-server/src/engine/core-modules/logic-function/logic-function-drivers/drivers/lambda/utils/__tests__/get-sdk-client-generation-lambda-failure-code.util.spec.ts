import { getSdkClientGenerationLambdaFailureCode } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-sdk-client-generation-lambda-failure-code.util';

describe('getSdkClientGenerationLambdaFailureCode', () => {
  it('should map a sandbox timeout to TIMED_OUT', () => {
    expect(
      getSdkClientGenerationLambdaFailureCode({
        functionError: 'Unhandled',
        payload: JSON.stringify({
          errorType: 'Sandbox.Timedout',
          errorMessage:
            'RequestId: abc Error: Task timed out after 120.00 seconds',
        }),
      }),
    ).toBe('TIMED_OUT');
  });

  it('should map a timeout reported only in the message to TIMED_OUT', () => {
    expect(
      getSdkClientGenerationLambdaFailureCode({
        functionError: 'Unhandled',
        payload: JSON.stringify({
          errorMessage:
            '2026-11-19T10:00:00Z abc Task timed out after 120.00 seconds',
        }),
      }),
    ).toBe('TIMED_OUT');
  });

  it('should map an out-of-memory kill to OUT_OF_MEMORY', () => {
    expect(
      getSdkClientGenerationLambdaFailureCode({
        functionError: 'Unhandled',
        payload: JSON.stringify({
          errorType: 'Runtime.OutOfMemory',
          errorMessage: 'Runtime exited with error: signal: killed',
        }),
      }),
    ).toBe('OUT_OF_MEMORY');
  });

  it('should map any other failure to FUNCTION_ERROR without its message', () => {
    const failureCode = getSdkClientGenerationLambdaFailureCode({
      functionError: 'Unhandled',
      payload: JSON.stringify({
        errorType: 'Error',
        errorMessage: 'description quoted from the schema',
      }),
    });

    expect(failureCode).toBe('FUNCTION_ERROR');
  });

  it('should map a payload that is not JSON to FUNCTION_ERROR', () => {
    expect(
      getSdkClientGenerationLambdaFailureCode({
        functionError: 'Unhandled',
        payload: 'not json',
      }),
    ).toBe('FUNCTION_ERROR');
  });

  it('should map a missing function error to EMPTY_RESPONSE', () => {
    expect(
      getSdkClientGenerationLambdaFailureCode({
        functionError: undefined,
        payload: undefined,
      }),
    ).toBe('EMPTY_RESPONSE');
  });
});
