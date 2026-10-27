import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application-runtime';
import {
  type AppEventSubscription,
  type EventOccurrence,
} from 'twenty-shared/application';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { frontComponentHostCommunicationApi } from '../globals/frontComponentHostCommunicationApi';
import { createServerSentEventParser } from '../utils/createServerSentEventParser';

const INITIAL_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 30_000;
const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404]);

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

  while (!signal.aborted) {
    try {
      const response = await fetch(
        `${process.env[DEFAULT_API_URL_NAME]}/${ApiPath.Rest}/${ApiPath.AppEvents}/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            Authorization: `Bearer ${process.env[DEFAULT_APP_ACCESS_TOKEN_NAME]}`,
          },
          body: JSON.stringify({ subscriptions }),
          signal,
        },
      );

      if (response.status === 401 && !hasRefreshedAccessToken) {
        hasRefreshedAccessToken = await refreshAccessToken();

        if (hasRefreshedAccessToken) {
          continue;
        }
      }

      if (NON_RETRYABLE_STATUSES.has(response.status)) {
        console.error(
          `Twenty app events: subscription refused (HTTP ${response.status})`,
        );

        return;
      }

      if (!response.ok || !isDefined(response.body)) {
        throw new Error(`HTTP ${response.status}`);
      }

      hasRefreshedAccessToken = false;
      retryDelayMs = INITIAL_RETRY_DELAY_MS;
      onConnected?.();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const pushChunk = createServerSentEventParser((serverSentEvent) => {
        if (serverSentEvent.event === 'occurrence') {
          onEvent(JSON.parse(serverSentEvent.data) as EventOccurrence);
        }
      });

      for (;;) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        pushChunk(decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      console.warn('Twenty app events: stream interrupted', error);
    }

    await waitUnlessAborted(retryDelayMs, signal);
    retryDelayMs = Math.min(retryDelayMs * 2, MAX_RETRY_DELAY_MS);
  }
};
