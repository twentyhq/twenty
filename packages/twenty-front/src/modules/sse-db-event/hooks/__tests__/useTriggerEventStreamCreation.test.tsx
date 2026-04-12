import { act, renderHook } from '@testing-library/react';

import { useTriggerEventStreamCreation } from '@/sse-db-event/hooks/useTriggerEventStreamCreation';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { disposeFunctionForEventStreamState } from '@/sse-db-event/states/disposeFunctionByEventStreamMapState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

import type { Store } from 'jotai/vanilla/store';

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}));

import { captureException } from '@sentry/react';

const mockCaptureException = captureException as jest.MockedFunction<
  typeof captureException
>;

describe('useTriggerEventStreamCreation', () => {
  let messageHandler:
    | ((params: { data: unknown; event: string }) => void)
    | null;
  let capturedStore: Store | null = null;

  const createWrapper = () =>
    getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
      onInitializeJotaiStore: (store: Store) => {
        capturedStore = store;

        messageHandler = null;

        const mockSubscribe = jest.fn(
          (_query: any, _observers: any, options: any) => {
            if (options?.message) {
              messageHandler = options.message;
            }
            return { unsubscribe: jest.fn() };
          },
        );

        store.set(sseClientState.atom, {
          subscribe: mockSubscribe,
          dispose: jest.fn(),
        } as any);
        store.set(sseEventStreamIdState.atom, null);
        store.set(isCreatingSseEventStreamState.atom, false);
        store.set(isDestroyingEventStreamState.atom, false);
        store.set(shouldDestroyEventStreamState.atom, false);
        store.set(disposeFunctionForEventStreamState.atom, {
          dispose: jest.fn(),
        });
      },
    });

  beforeEach(() => {
    jest.clearAllMocks();
    messageHandler = null;
    capturedStore = null;
  });

  it('marks stream for destruction without reporting UNAUTHENTICATED subCode to Sentry', async () => {
    const Wrapper = createWrapper();
    const {
      result: { current },
    } = renderHook(() => useTriggerEventStreamCreation(), { wrapper: Wrapper });

    current.triggerEventStreamCreation();

    await act(async () => {
      messageHandler!({
        data: {
          errors: [
            {
              message: 'Unauthorized',
              extensions: {
                code: 'UNAUTHENTICATED',
                subCode: 'UNAUTHENTICATED',
              },
            },
          ],
        },
        event: 'next',
      });
    });

    expect(capturedStore!.get(shouldDestroyEventStreamState.atom)).toBe(true);
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('marks stream for destruction without reporting FORBIDDEN subCode to Sentry', async () => {
    const Wrapper = createWrapper();
    const {
      result: { current },
    } = renderHook(() => useTriggerEventStreamCreation(), { wrapper: Wrapper });

    current.triggerEventStreamCreation();

    await act(async () => {
      messageHandler!({
        data: {
          errors: [
            {
              message: 'Forbidden',
              extensions: {
                code: 'FORBIDDEN',
                subCode: 'FORBIDDEN',
              },
            },
          ],
        },
        event: 'next',
      });
    });

    expect(capturedStore!.get(shouldDestroyEventStreamState.atom)).toBe(true);
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('reports unexpected error subCodes to Sentry', async () => {
    const Wrapper = createWrapper();
    const {
      result: { current },
    } = renderHook(() => useTriggerEventStreamCreation(), { wrapper: Wrapper });

    current.triggerEventStreamCreation();

    await act(async () => {
      messageHandler!({
        data: {
          errors: [
            {
              message: 'Something went wrong',
              extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                subCode: 'UNKNOWN_ERROR',
              },
            },
          ],
        },
        event: 'next',
      });
    });

    expect(mockCaptureException).toHaveBeenCalledTimes(1);
    expect(capturedStore!.get(shouldDestroyEventStreamState.atom)).toBe(true);
  });
});
