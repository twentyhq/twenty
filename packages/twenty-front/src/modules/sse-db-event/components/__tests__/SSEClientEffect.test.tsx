import { render } from '@testing-library/react';
import { type ClientOptions } from 'graphql-sse';
import { createStore, Provider } from 'jotai';

import { SSEClientEffect } from '@/sse-db-event/components/SSEClientEffect';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';

const mockClientOptions: ClientOptions[] = [];

jest.mock('graphql-sse', () => ({
  createClient: (options: ClientOptions) => {
    mockClientOptions.push(options);

    return { subscribe: jest.fn(), iterate: jest.fn(), dispose: jest.fn() };
  },
}));

jest.mock('@/auth/hooks/useIsLogged', () => ({
  useIsLogged: () => true,
}));

jest.mock('@/metadata-store/hooks/useResyncMetadataStore', () => ({
  useResyncMetadataStore: () => ({ resyncMetadataStore: jest.fn() }),
}));

jest.mock('@/sse-db-event/hooks/useHandleSseClientConnectionRetry', () => ({
  useHandleSseClientConnectionRetry: () => ({
    handleSseClientConnectionRetry: jest.fn(),
  }),
}));

const ACTIVE_QUERY_LISTENER = {
  queryId: 'record-table',
  operationSignature: { objectNameSingular: 'company', variables: {} },
};

const setup = () => {
  const store = createStore();

  store.set(activeQueryListenersState.atom, [ACTIVE_QUERY_LISTENER]);

  render(
    <Provider store={store}>
      <SSEClientEffect />
    </Provider>,
  );

  const handleConnected = (reconnected: boolean) =>
    mockClientOptions[mockClientOptions.length - 1].on?.connected?.(
      reconnected,
    );

  return { store, handleConnected };
};

describe('SSEClientEffect', () => {
  beforeEach(() => {
    mockClientOptions.length = 0;
  });

  it('should request a new event stream when the connection is re-established', () => {
    const { store, handleConnected } = setup();

    handleConnected(true);

    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(true);
  });

  it('should clear the active listeners on a first connection without requesting a new stream', () => {
    const { store, handleConnected } = setup();

    handleConnected(false);

    expect(store.get(activeQueryListenersState.atom)).toEqual([]);
    expect(store.get(shouldDestroyEventStreamState.atom)).toBe(false);
  });
});
