import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application-runtime';
import {
  type AppEventSubscription,
  type EventOccurrence,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { frontComponentHostCommunicationApi } from '../globals/frontComponentHostCommunicationApi';
import { createServerSentEventParser } from '../utils/createServerSentEventParser';

const ON_APP_EVENT_SUBSCRIPTION = `
  subscription OnAppEvent($input: OnAppEventInput!) {
    onAppEvent(input: $input) {
      occurrence {
        id
        type
        occurredAt
        properties
      }
    }
  }
`;

const INITIAL_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 30_000;
const NON_RETRYABLE_ERROR_CODES = new Set([
  'BAD_USER_INPUT',
  'FORBIDDEN',
  'NOT_FOUND',
]);

type AppEventStreamMessage = {
  data?: { onAppEvent: { occurrence: EventOccurrence | null } } | null;
  errors?: { message: string; extensions?: { code?: string } }[];
};

type StreamOutcome = 'reconnect' | 'refreshAccessToken' | 'stop';

const waitUnlessAborted = (delayMs: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, delayMs);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });

const refreshAccessToken = async (): Promise<boolean> => {
  const requestAccessTokenRefresh =
    frontComponentHostCommunicationApi?.requestAccessTokenRefresh;

  if (!isDefined(requestAccessTokenRefresh)) {
    return false;
  }

  const refreshedAccessToken = await requestAccessTokenRefresh();

  process.env[DEFAULT_APP_ACCESS_TOKEN_NAME] = refreshedAccessToken;

  return true;
};

const getOutcomeOfErrors = (
  errors: NonNullable<AppEventStreamMessage['errors']>,
): StreamOutcome => {
  const codes = errors.map((error) => error.extensions?.code);

  if (codes.includes('UNAUTHENTICATED')) {
    return 'refreshAccessToken';
  }

  if (
    codes.some((code) => isDefined(code) && NON_RETRYABLE_ERROR_CODES.has(code))
  ) {
    console.error(
      `Twenty app events: subscription refused (${errors.map((error) => error.message).join(', ')})`,
    );

    return 'stop';
  }

  return 'reconnect';
};

export const subscribeToAppEvents = async ({
  subscriptions,
  onEvent,
  onConnected,
  signal,
}: {
  subscriptions: AppEventSubscription[];
  onEvent: (occurrence: EventOccurrence) => void;
  onConnected?: () => void;
  signal: AbortSignal;
}): Promise<void> => {
  let retryDelayMs = INITIAL_RETRY_DELAY_MS;
  let hasRefreshedAccessToken = false;

  const streamOnce = async (): Promise<StreamOutcome> => {
    const response = await fetch(
      `${process.env[DEFAULT_API_URL_NAME]}/metadata`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: `Bearer ${process.env[DEFAULT_APP_ACCESS_TOKEN_NAME]}`,
        },
        body: JSON.stringify({
          query: ON_APP_EVENT_SUBSCRIPTION,
          variables: { input: { subscriptions } },
        }),
        signal,
      },
    );

    if (
      !response.headers.get('Content-Type')?.includes('text/event-stream') ||
      !isDefined(response.body)
    ) {
      const message = (await response
        .json()
        .catch(() => ({}))) as AppEventStreamMessage;

      return isDefined(message.errors)
        ? getOutcomeOfErrors(message.errors)
        : 'reconnect';
    }

    let outcome: StreamOutcome = 'reconnect';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const pushChunk = createServerSentEventParser(({ event, data }) => {
      if (event !== 'next') {
        return;
      }

      const message = JSON.parse(data) as AppEventStreamMessage;

      if (isDefined(message.errors) && message.errors.length > 0) {
        outcome = getOutcomeOfErrors(message.errors);

        return;
      }

      const occurrence = message.data?.onAppEvent.occurrence;

      if (isDefined(occurrence)) {
        onEvent(occurrence);

        return;
      }

      hasRefreshedAccessToken = false;
      retryDelayMs = INITIAL_RETRY_DELAY_MS;
      onConnected?.();
    });

    for (;;) {
      const { done, value } = await reader.read();

      if (done) {
        return outcome;
      }

      pushChunk(decoder.decode(value, { stream: true }));
    }
  };

  while (!signal.aborted) {
    let outcome: StreamOutcome = 'reconnect';

    try {
      outcome = await streamOnce();
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      console.warn('Twenty app events: stream interrupted', error);
    }

    if (outcome === 'stop') {
      return;
    }

    if (outcome === 'refreshAccessToken') {
      if (!hasRefreshedAccessToken) {
        hasRefreshedAccessToken = await refreshAccessToken();

        if (hasRefreshedAccessToken) {
          continue;
        }
      }

      console.error('Twenty app events: the access token was refused');

      return;
    }

    await waitUnlessAborted(retryDelayMs, signal);
    retryDelayMs = Math.min(retryDelayMs * 2, MAX_RETRY_DELAY_MS);
  }
};
