import { APICallError, RetryError, StreamProviderError } from 'ai';

import { getAiSdkErrorFingerprint } from 'src/engine/core-modules/exception-handler/utils/get-ai-sdk-error-fingerprint.util';

describe('getAiSdkErrorFingerprint', () => {
  it('should group provider errors by error class, HTTP status and provider code', () => {
    expect(
      getAiSdkErrorFingerprint(
        new APICallError({
          message:
            'The image data you provided does not represent a valid image.',
          url: 'https://api.openai.com/v1/responses',
          requestBodyValues: {},
          statusCode: 400,
          data: {
            error: {
              message:
                'The image data you provided does not represent a valid image.',
              type: 'invalid_request_error',
              code: 'invalid_image_format',
            },
          },
        }),
      ),
    ).toEqual([
      'ai-sdk-error',
      'AI_APICallError',
      '400',
      'invalid_image_format',
    ]);
  });

  it('should group exhausted retries with the error that was retried', () => {
    const overloaded = new StreamProviderError({
      message: 'Overloaded',
      statusCode: 503,
    });

    expect(
      getAiSdkErrorFingerprint(
        new RetryError({
          message: 'Failed after 3 attempts. Last error: Overloaded',
          reason: 'maxRetriesExceeded',
          errors: [overloaded, overloaded],
        }),
      ),
    ).toEqual(['ai-sdk-error', 'AI_StreamProviderError', '503', 'no-code']);
  });
});
