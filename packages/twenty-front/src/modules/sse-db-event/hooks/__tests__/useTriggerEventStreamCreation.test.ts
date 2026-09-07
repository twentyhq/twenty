import { act, renderHook } from '@testing-library/react';
import { type Client, type Sink } from 'graphql-sse';
import { createStore, Provider } from 'jotai';
import { createElement, type ReactNode } from 'react';

import { useTriggerEventStreamCreation } from '@/sse-db-event/hooks/useTriggerEventStreamCreation';
import { disposeFunctionForEventStreamState } from '@/sse-db-event/states/disposeFunctionByEventStreamMapState';
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

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}));

type SubscriptionSink = Sink<unknown>;

const setup = () => {
  const store = createStore();
  const sinks: SubscriptionSink[] = [];

  const sseClient: Client = {
    subscribe: (_request, sink) => {
      sinks.push(sink as SubscriptionSink);

      return () => {};
    },
    iterate: async function* () {},
    dispose: () => {},
  };

  store.set(sseClientState.atom, sseClient);
  store.set(shouldDestroyEventStreamState.atom, false);

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store }, children);

  const { result } = renderHook(() => useTriggerEventStreamCreation(), {
    wrapper,
  });

  return { store, sinks, result };
};

const destroyCurrentEventStream = (store: ReturnType<typeof createStore>) => {
  store.set(sseEventStreamIdState.atom, null);
  store.set(disposeFunctionForEventStreamState.atom, null);
  store.set(shouldDestroyEventStreamState.atom, false);
};

describe('useTriggerEventStreamCreation', () => {
  it('should request a destroy when the current subscription completes', () => {
    const { store, sinks, result } = setup();

    act(() => result.current.triggerEventStreamCreation());

    act(() => sinks[0].complete());

    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(true);
  });

  it('should ignore the completion of a subscription that was already destroyed', () => {
    const { store, sinks, result } = setup();

    act(() => result.current.triggerEventStreamCreation());
    act(() => destroyCurrentEventStream(store));

    act(() => sinks[0].complete());

    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(false);
  });

  it('should ignore an error from a subscription that was already destroyed', () => {
    const { store, sinks, result } = setup();

    act(() => result.current.triggerEventStreamCreation());
    act(() => destroyCurrentEventStream(store));

    act(() => sinks[0].error(new Error('connection lost')));

    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(false);
  });

  it('should ignore a stale completion once a new stream has replaced it', () => {
    const { store, sinks, result } = setup();

    act(() => result.current.triggerEventStreamCreation());
    act(() => destroyCurrentEventStream(store));
    act(() => result.current.triggerEventStreamCreation());

    act(() => sinks[0].complete());

    expect(sinks).toHaveLength(2);
    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(false);
  });
});
