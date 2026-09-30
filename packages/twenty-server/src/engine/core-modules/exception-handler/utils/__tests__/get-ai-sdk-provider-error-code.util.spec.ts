import { APICallError, InvalidPromptError, StreamProviderError } from 'ai';

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
      'the OpenAI error code',
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
      'the OpenAI error type when the code is null',
      {
        error: {
          message: 'Invalid image',
          type: 'invalid_request_error',
          code: null,
        },
      },
      'invalid_request_error',
    ],
    [
      'the Anthropic error type',
      { type: 'error', error: { type: 'overloaded_error', message: 'Busy' } },
      'overloaded_error',
    ],
    [
      'the Google status rather than its numeric code',
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
      'a top-level code',
      { object: 'error', message: 'Bad', type: 'invalid_model', code: '1500' },
      '1500',
    ],
    ['nothing without a response body', undefined, undefined],
  ])('should read %s', (_, data, expectedCode) => {
    expect(getAiSdkProviderErrorCode(buildApiCallError(data))).toBe(
      expectedCode,
    );
  });

  it('should read the code of a mid-stream provider error', () => {
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

  it('should return nothing for errors that carry no provider response', () => {
    expect(
      getAiSdkProviderErrorCode(
        new InvalidPromptError({ prompt: [], message: 'Invalid messages' }),
      ),
    ).toBeUndefined();
  });
});
