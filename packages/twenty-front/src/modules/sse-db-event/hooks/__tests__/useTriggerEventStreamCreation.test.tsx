import { act, renderHook } from '@testing-library/react';
import { type Client } from 'graphql-sse';
import { createStore, Provider } from 'jotai';
import { createElement, type ReactNode } from 'react';

import { useTriggerEventStreamCreation } from '@/sse-db-event/hooks/useTriggerEventStreamCreation';
import { useTriggerEventStreamDestroy } from '@/sse-db-event/hooks/useTriggerEventStreamDestroy';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';

jest.mock(
  '@/sse-db-event/hooks/useDispatchMetadataEventsFromSseToBrowserEvents',
  () => ({
    useDispatchMetadataEventsFromSseToBrowserEvents: () => ({
      dispatchMetadataEventsFromSseToBrowserEvents: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/sse-db-event/hooks/useDispatchObjectRecordEventsFromSseToBrowserEvents',
  () => ({
    useDispatchObjectRecordEventsFromSseToBrowserEvents: () => ({
      dispatchObjectRecordEventsFromSseToBrowserEvents: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseEvents',
  () => ({
    useTriggerOptimisticEffectFromSseEvents: () => ({
      triggerOptimisticEffectFromSseEvents: jest.fn(),
    }),
  }),
);

const buildSseClientCompletingAfterDispose = () => {
  const completeSubscriptionCallbacks: (() => void)[] = [];

  const sseClient: Client = {
    subscribe: (_request, sink) => {
      completeSubscriptionCallbacks.push(() => sink.complete());

      return () => {
        void Promise.resolve().then(() => sink.complete());
      };
    },
    iterate: async function* () {},
    dispose: jest.fn(),
  };

  return { sseClient, completeSubscriptionCallbacks };
};

const setup = () => {
  const store = createStore();
  const { sseClient, completeSubscriptionCallbacks } =
    buildSseClientCompletingAfterDispose();

  store.set(sseClientState.atom, sseClient);

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store }, children);

  const { result } = renderHook(
    () => ({
      ...useTriggerEventStreamCreation(),
      ...useTriggerEventStreamDestroy(),
    }),
    { wrapper },
  );

  return { store, completeSubscriptionCallbacks, result };
};

describe('useTriggerEventStreamCreation', () => {
  it('should let a new stream be created after destroying a live one', async () => {
    const { store, completeSubscriptionCallbacks, result } = setup();

    act(() => {
      result.current.triggerEventStreamCreation();
    });

    const firstEventStreamId = store.get(sseEventStreamIdState.atom);

    await act(async () => {
      result.current.triggerEventStreamDestroy();
      await Promise.resolve();
    });

    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(false);
    expect(store.get(sseEventStreamIdState.atom)).toBeNull();

    act(() => {
      result.current.triggerEventStreamCreation();
    });

    expect(completeSubscriptionCallbacks).toHaveLength(2);
    expect(store.get(sseEventStreamIdState.atom)).not.toBe(firstEventStreamId);
  });

  it('should clear the active listeners when destroying the stream', () => {
    const { store, result } = setup();

    act(() => {
      result.current.triggerEventStreamCreation();
    });

    store.set(activeQueryListenersState.atom, [
      {
        queryId: 'record-table-virtualized-company',
        operationSignature: { objectNameSingular: 'company', variables: {} },
      },
    ]);

    act(() => {
      result.current.triggerEventStreamDestroy();
    });

    expect(store.get(activeQueryListenersState.atom)).toEqual([]);
  });

  it('should request a destroy when the current stream completes', () => {
    const { store, completeSubscriptionCallbacks, result } = setup();

    act(() => {
      result.current.triggerEventStreamCreation();
    });

    act(() => {
      completeSubscriptionCallbacks[0]();
    });

    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(true);
  });
});
