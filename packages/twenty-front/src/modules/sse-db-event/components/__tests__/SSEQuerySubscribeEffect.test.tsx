import { act, render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { createElement } from 'react';

import { SSEQuerySubscribeEffect } from '@/sse-db-event/components/SSEQuerySubscribeEffect';
import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';

type PendingMutation = {
  eventStreamId: string;
  queryId: string;
  resolve: (isKnownStream: boolean) => void;
};

const pendingAddQueryMutations: PendingMutation[] = [];

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [
    ({
      variables,
    }: {
      variables: { input: { eventStreamId: string; queryId: string } };
    }) =>
      new Promise((resolve) => {
        pendingAddQueryMutations.push({
          eventStreamId: variables.input.eventStreamId,
          queryId: variables.input.queryId,
          resolve: (isKnownStream) =>
            resolve({ data: { addQueryToEventStream: isKnownStream } }),
        });
      }),
  ],
}));

const COMPANIES_QUERY_LISTENER = {
  queryId: 'record-table-virtualized-company',
  operationSignature: { objectNameSingular: 'company', variables: {} },
};

const renderWithStream = (eventStreamId: string) => {
  const store = createStore();

  store.set(sseEventStreamIdState.atom, eventStreamId);
  store.set(sseEventStreamReadyState.atom, true);
  store.set(requiredQueryListenersState.atom, [COMPANIES_QUERY_LISTENER]);

  render(
    createElement(
      Provider,
      { store },
      createElement(SSEQuerySubscribeEffect, null),
    ),
  );

  return store;
};

const replaceStream = (
  store: ReturnType<typeof createStore>,
  eventStreamId: string,
) => {
  store.set(sseEventStreamIdState.atom, null);
  store.set(sseEventStreamReadyState.atom, false);
  store.set(sseEventStreamIdState.atom, eventStreamId);
  store.set(sseEventStreamReadyState.atom, true);
};

const sentEventStreamIds = () =>
  pendingAddQueryMutations.map((mutation) => mutation.eventStreamId);

describe('SSEQuerySubscribeEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    pendingAddQueryMutations.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should register every required query on the ready stream', () => {
    renderWithStream('stream-a');

    expect(sentEventStreamIds()).toEqual(['stream-a']);
    expect(pendingAddQueryMutations[0].queryId).toBe(
      COMPANIES_QUERY_LISTENER.queryId,
    );
  });

  it('should register the required queries again on a replacement stream', async () => {
    const store = renderWithStream('stream-a');

    act(() => replaceStream(store, 'stream-b'));

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(sentEventStreamIds()).toEqual(['stream-a', 'stream-b']);
  });

  it('should not destroy the current stream because a replaced one is unknown', async () => {
    const store = renderWithStream('stream-a');

    act(() => replaceStream(store, 'stream-b'));

    await act(async () => {
      pendingAddQueryMutations[0].resolve(false);
    });

    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(false);
  });

  it('should destroy the current stream when the server does not know it', async () => {
    const store = renderWithStream('stream-a');

    await act(async () => {
      pendingAddQueryMutations[0].resolve(false);
    });

    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(true);
  });
});
