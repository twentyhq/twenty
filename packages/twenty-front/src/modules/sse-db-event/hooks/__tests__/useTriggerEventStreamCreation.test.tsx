import { act, renderHook } from '@testing-library/react';
import { type Client, type Sink } from 'graphql-sse';
import { createStore, Provider } from 'jotai';
import { createElement, type ReactNode } from 'react';

import { useTriggerEventStreamCreation } from '@/sse-db-event/hooks/useTriggerEventStreamCreation';
import { useTriggerEventStreamDestroy } from '@/sse-db-event/hooks/useTriggerEventStreamDestroy';
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
  const sinks: Sink[] = [];

  const sseClient: Client = {
    subscribe: (_request, sink) => {
      sinks.push(sink as Sink);

      return () => {
        void Promise.resolve().then(() => sink.complete());
      };
    },
    iterate: async function* () {},
    dispose: jest.fn(),
  };

  return { sseClient, sinks };
};

const setup = () => {
  const store = createStore();
  const { sseClient, sinks } = buildSseClientCompletingAfterDispose();

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

  return { store, sinks, result };
};

describe('useTriggerEventStreamCreation', () => {
  it('should let a new stream be created after destroying a live one', async () => {
    const { store, sinks, result } = setup();

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

    expect(sinks).toHaveLength(2);
    expect(store.get(sseEventStreamIdState.atom)).not.toBe(firstEventStreamId);
  });

  it('should request a destroy when the current stream completes', () => {
    const { store, sinks, result } = setup();

    act(() => {
      result.current.triggerEventStreamCreation();
    });

    act(() => {
      sinks[0].complete();
    });

    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(true);
  });
});
