import { APICallError, StreamProviderError } from 'ai';

import { getAiSdkProviderErrorCode } from 'src/engine/core-modules/exception-handler/utils/get-ai-sdk-provider-error-code.util';

const buildApiCallError = (data: unknown) =>
  new APICallError({
    message: 'Bad request',
    url: 'https://api.example.com',
    requestBodyValues: {},
    statusCode: 400,
    data,
  });

describe('getAiSdkProviderErrorCode', () => {
  it.each([
    [
      'the code before the type',
      {
        error: {
          message: 'Too long',
          type: 'invalid_request_error',
          code: 'context_length_exceeded',
        },
      },
      'context_length_exceeded',
    ],
    [
      'the status when the code is not a string',
      {
        error: {
          code: 400,
          message: 'Bad argument',
          status: 'INVALID_ARGUMENT',
        },
      },
      'INVALID_ARGUMENT',
    ],
    [
      'a code at the top level of the body',
      { object: 'error', message: 'Bad', type: 'invalid_model', code: '1500' },
      '1500',
    ],
  ])('should read %s', (_, data, expectedCode) => {
    expect(getAiSdkProviderErrorCode(buildApiCallError(data))).toBe(
      expectedCode,
    );
  });

  it('should read the type of a mid-stream provider error', () => {
    expect(
      getAiSdkProviderErrorCode(
        new StreamProviderError({
          message: 'Overloaded',
          type: 'overloaded_error',
          statusCode: 529,
        }),
      ),
    ).toBe('overloaded_error');
  });
});
