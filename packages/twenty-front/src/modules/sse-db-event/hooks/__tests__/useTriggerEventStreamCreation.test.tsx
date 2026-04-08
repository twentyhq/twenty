import { renderHook } from '@testing-library/react';

import { captureException } from '@sentry/react';
import { useStore } from 'jotai';

import { useDispatchMetadataEventsFromSseToBrowserEvents } from '@/sse-db-event/hooks/useDispatchMetadataEventsFromSseToBrowserEvents';
import { useDispatchObjectRecordEventsFromSseToBrowserEvents } from '@/sse-db-event/hooks/useDispatchObjectRecordEventsFromSseToBrowserEvents';
import { useTriggerEventStreamCreation } from '@/sse-db-event/hooks/useTriggerEventStreamCreation';
import { useTriggerOptimisticEffectFromSseEvents } from '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseEvents';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}));

jest.mock('jotai', () => {
  const actual = jest.requireActual('jotai');

  return {
    ...actual,
    useStore: jest.fn(),
  };
});

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: jest.fn(),
}));

jest.mock(
  '@/sse-db-event/hooks/useDispatchMetadataEventsFromSseToBrowserEvents',
  () => ({
    useDispatchMetadataEventsFromSseToBrowserEvents: jest.fn(),
  }),
);

jest.mock(
  '@/sse-db-event/hooks/useDispatchObjectRecordEventsFromSseToBrowserEvents',
  () => ({
    useDispatchObjectRecordEventsFromSseToBrowserEvents: jest.fn(),
  }),
);

jest.mock(
  '@/sse-db-event/hooks/useTriggerOptimisticEffectFromSseEvents',
  () => ({
    useTriggerOptimisticEffectFromSseEvents: jest.fn(),
  }),
);

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'stream-id-123'),
}));

describe('useTriggerEventStreamCreation', () => {
  const mockSet = jest.fn();
  const mockGet = jest.fn();
  const mockSubscribe = jest.fn();
  const mockSetIsCreating = jest.fn();
  let subscriptionHandlers: Record<string, any> | undefined;

  beforeEach(() => {
    jest.clearAllMocks();

    subscriptionHandlers = undefined;

    mockGet.mockImplementation((atom) => {
      switch (atom) {
        case sseClientState.atom:
          return { subscribe: mockSubscribe };
        case isCreatingSseEventStreamState.atom:
          return false;
        case isDestroyingEventStreamState.atom:
          return false;
        case sseEventStreamIdState.atom:
          return null;
        default:
          return undefined;
      }
    });

    mockSubscribe.mockImplementation((_payload, _handlers, observer) => {
      subscriptionHandlers = observer;

      return jest.fn();
    });

    (useStore as jest.Mock).mockReturnValue({
      get: mockGet,
      set: mockSet,
    });

    (useSetAtomState as jest.Mock).mockReturnValue(mockSetIsCreating);

    (
      useDispatchMetadataEventsFromSseToBrowserEvents as jest.Mock
    ).mockReturnValue({
      dispatchMetadataEventsFromSseToBrowserEvents: jest.fn(),
    });

    (
      useDispatchObjectRecordEventsFromSseToBrowserEvents as jest.Mock
    ).mockReturnValue({
      dispatchObjectRecordEventsFromSseToBrowserEvents: jest.fn(),
    });

    (useTriggerOptimisticEffectFromSseEvents as jest.Mock).mockReturnValue({
      triggerOptimisticEffectFromSseEvents: jest.fn(),
    });
  });

  it('should not capture recoverable unauthenticated SSE reconnect errors', () => {
    const { result } = renderHook(() => useTriggerEventStreamCreation());

    result.current.triggerEventStreamCreation();

    expect(subscriptionHandlers).toBeDefined();

    subscriptionHandlers?.message({
      event: 'next',
      data: {
        errors: [
          {
            message: 'Authentication token expired',
            extensions: {
              code: 'UNAUTHENTICATED',
            },
          },
        ],
      },
    });

    expect(captureException).not.toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(
      shouldDestroyEventStreamState.atom,
      true,
    );
  });
});
