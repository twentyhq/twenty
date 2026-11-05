import {
  defaultStackParser,
  extraErrorDataIntegration,
  makeNodeTransport,
  NodeClient,
  type ErrorEvent,
} from '@sentry/node';
import { APICallError, NoObjectGeneratedError, RetryError } from 'ai';

import { removeAiContentFromSentryEvent } from 'src/engine/core-modules/exception-handler/utils/remove-ai-content-from-sentry-event.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const PROMPT = 'Summarize this confidential deal';

const buildProviderError = () =>
  new APICallError({
    message: 'Rate limited',
    url: 'https://api.provider.test/v1/messages',
    requestBodyValues: { prompt: PROMPT },
    statusCode: 429,
    responseBody: `{"echo":"${PROMPT}"}`,
    isRetryable: true,
  });

const buildUnparsableOutputError = () =>
  new NoObjectGeneratedError({
    text: PROMPT,
    response: {
      id: 'response-id',
      timestamp: new Date(0),
      modelId: 'model-id',
    },
    usage: {
      inputTokens: 1,
      inputTokenDetails: {
        noCacheTokens: 1,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      outputTokens: 1,
      outputTokenDetails: { textTokens: 1, reasoningTokens: 0 },
      totalTokens: 2,
    },
    finishReason: 'stop',
  });

const buildEventFromError = async (error: Error): Promise<ErrorEvent> => {
  const event = await extraErrorDataIntegration().processEvent?.(
    { type: undefined, exception: { values: [] } },
    { originalException: error },
    new NodeClient({
      integrations: [],
      stackParser: defaultStackParser,
      transport: makeNodeTransport,
    }),
  );

  return { ...event, type: undefined };
};

describe('removeAiContentFromSentryEvent', () => {
  it.each([
    ['a provider error', () => buildProviderError()],
    [
      'a retry error',
      () =>
        new RetryError({
          message: 'Retries exhausted',
          reason: 'maxRetriesExceeded',
          errors: [buildProviderError()],
        }),
    ],
    [
      'an error wrapping a provider error',
      () =>
        Object.assign(new Error('Wrapped'), { cause: buildProviderError() }),
    ],
    [
      'an AI exception carrying the unparsable model output',
      () =>
        Object.assign(
          new AiException(
            'The model did not return an object matching the response format',
            AiExceptionCode.AGENT_EXECUTION_FAILED,
          ),
          { cause: buildUnparsableOutputError() },
        ),
    ],
  ])('should keep AI content out of %s', async (_label, buildError) => {
    const event = await buildEventFromError(buildError());

    expect(JSON.stringify(event)).toContain(PROMPT);

    const sanitizedEvent = removeAiContentFromSentryEvent(event);

    expect(JSON.stringify(sanitizedEvent)).not.toContain(PROMPT);
  });

  it('should keep the diagnostics of a provider error', async () => {
    const sanitizedEvent = removeAiContentFromSentryEvent(
      await buildEventFromError(buildProviderError()),
    );

    expect(sanitizedEvent.contexts?.AI_APICallError).toEqual({
      statusCode: 429,
      isRetryable: true,
      url: 'https://api.provider.test/v1/messages',
    });
  });

  it('should keep the diagnostics of a wrapped provider error and the data of its wrapper', () => {
    const event: ErrorEvent = {
      type: undefined,
      contexts: {
        Error: {
          code: 'WRAPPER_CODE',
          cause: {
            AI_APICallError: { statusCode: 429, requestBodyValues: PROMPT },
          },
        },
      },
    };

    expect(removeAiContentFromSentryEvent(event).contexts?.Error).toEqual({
      code: 'WRAPPER_CODE',
      cause: { AI_APICallError: { statusCode: 429 } },
    });
  });

  it('should leave the cause of other errors untouched', () => {
    const event: ErrorEvent = {
      type: undefined,
      contexts: {
        Error: { cause: { QueryFailedError: { query: 'SELECT 1' } } },
      },
    };

    expect(removeAiContentFromSentryEvent(event)).toEqual(event);
  });

  it('should leave other error contexts untouched', () => {
    const event: ErrorEvent = {
      type: undefined,
      contexts: { QueryFailedError: { query: 'SELECT 1' } },
    };

    expect(removeAiContentFromSentryEvent(event)).toEqual(event);
  });
});
