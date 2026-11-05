import { act, render } from '@testing-library/react';
import { GraphQLError, type ExecutionResult } from 'graphql';
import { type Client, type Sink } from 'graphql-sse';
import { createStore, Provider } from 'jotai';

import { currentUserState } from '@/auth/states/currentUserState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { SSEEventStreamEffect } from '@/sse-db-event/components/SSEEventStreamEffect';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { mockedUserData } from '~/testing/mock-data/users';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

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

type RespondToSubscription = <TData, TExtensions>(
  sink: Sink<ExecutionResult<TData, TExtensions>>,
) => void;

const rejectSubscription: RespondToSubscription = (sink) => {
  sink.next({
    errors: [
      new GraphQLError('Missing authentication token', {
        extensions: { code: 'UNAUTHENTICATED', subCode: 'UNAUTHENTICATED' },
      }),
    ],
  });
  sink.complete();
};

const renderEffect = (
  respondToSubscription: RespondToSubscription = rejectSubscription,
) => {
  const store = createStore();
  const subscribe = jest.fn();

  const sseClient: Client = {
    subscribe: (_request, sink) => {
      subscribe();
      void Promise.resolve().then(() => respondToSubscription(sink));

      return () => {};
    },
    iterate: async function* () {},
    dispose: jest.fn(),
  };

  store.set(sseClientState.atom, sseClient);
  store.set(currentUserState.atom, mockedUserData);
  store.set(isCookieAuthActiveState.atom, true);
  store.set(isMinimalMetadataReadyState.atom, true);
  setTestObjectMetadataItemsInMetadataStore(
    store,
    getTestEnrichedObjectMetadataItemsMock(),
  );

  render(
    <Provider store={store}>
      <SSEEventStreamEffect />
    </Provider>,
  );

  return { subscribe };
};

const advanceTime = (timeInMs: number) =>
  act(async () => {
    await jest.advanceTimersByTimeAsync(timeInMs);
  });

// React only flushes state updates when act exits, so a single long advance would skip cycles
const advanceTimeInOneSecondSteps = async (stepCount: number) => {
  for (let step = 0; step < stepCount; step++) {
    await advanceTime(1_000);
  }
};

describe('SSEEventStreamEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(1);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should back off when the server keeps rejecting the subscription', async () => {
    const { subscribe } = renderEffect();

    await advanceTime(0);
    expect(subscribe).toHaveBeenCalledTimes(1);

    await advanceTime(999);
    expect(subscribe).toHaveBeenCalledTimes(1);

    await advanceTime(1);
    expect(subscribe).toHaveBeenCalledTimes(2);

    await advanceTime(1_999);
    expect(subscribe).toHaveBeenCalledTimes(2);

    await advanceTime(1);
    expect(subscribe).toHaveBeenCalledTimes(3);
  });

  it('should retry at most every two minutes once the wait is capped', async () => {
    const { subscribe } = renderEffect();

    await advanceTimeInOneSecondSteps(15 * 60);
    const callCountAtCap = subscribe.mock.calls.length;

    await advanceTimeInOneSecondSteps(10 * 60);
    const callCountInTenMinutes = subscribe.mock.calls.length - callCountAtCap;

    expect(callCountInTenMinutes).toBeGreaterThan(0);
    expect(callCountInTenMinutes).toBeLessThanOrEqual(5);
  });

  it('should recreate a healthy stream without waiting', async () => {
    let endStream = () => {};
    const { subscribe } = renderEffect((sink) => {
      sink.next({});
      endStream = () => sink.complete();
    });

    await advanceTime(60_000);
    expect(subscribe).toHaveBeenCalledTimes(1);

    await act(async () => {
      endStream();
    });
    await advanceTime(0);

    expect(subscribe).toHaveBeenCalledTimes(2);
  });
});
