import { extraErrorDataIntegration, type ErrorEvent } from '@sentry/node';
import { APICallError } from 'ai';

import { removeAiContentFromSentryEvent } from 'src/engine/core-modules/exception-handler/utils/remove-ai-content-from-sentry-event.util';

const PROMPT = 'Summarize this confidential deal';

const buildEventFromProviderError = async (): Promise<ErrorEvent> => {
  const providerError = new APICallError({
    message: 'Rate limited',
    url: 'https://api.provider.test/v1/messages',
    requestBodyValues: { prompt: PROMPT },
    statusCode: 429,
    responseBody: `{"echo":"${PROMPT}"}`,
    isRetryable: true,
  });

  const event = await extraErrorDataIntegration().processEvent?.(
    { type: undefined, exception: { values: [] } },
    { originalException: providerError },
    { getOptions: () => ({ maxValueLength: 8192 }) } as never,
  );

  return event as ErrorEvent;
};

describe('removeAiContentFromSentryEvent', () => {
  it('should keep prompts out of a real provider error captured by Sentry', async () => {
    const event = await buildEventFromProviderError();

    expect(JSON.stringify(event)).toContain(PROMPT);

    const sanitizedEvent = removeAiContentFromSentryEvent(event);

    expect(JSON.stringify(sanitizedEvent)).not.toContain(PROMPT);
  });

  it('should keep the diagnostics of a provider error', async () => {
    const sanitizedEvent = removeAiContentFromSentryEvent(
      await buildEventFromProviderError(),
    );

    expect(sanitizedEvent.contexts?.AI_APICallError).toEqual({
      statusCode: 429,
      isRetryable: true,
      url: 'https://api.provider.test/v1/messages',
    });
  });

  it('should leave other error contexts untouched', () => {
    const event: ErrorEvent = {
      type: undefined,
      contexts: { QueryFailedError: { query: 'SELECT 1' } },
    };

    expect(removeAiContentFromSentryEvent(event)).toEqual(event);
  });
});
