import { render } from '@testing-library/react';
import { type ClientOptions } from 'graphql-sse';
import { createStore, Provider } from 'jotai';
import { createElement } from 'react';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { SSEClientEffect } from '@/sse-db-event/components/SSEClientEffect';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const createClientMock = jest.fn();

jest.mock('graphql-sse', () => ({
  createClient: (options: ClientOptions) => {
    createClientMock(options);

    return {
      subscribe: () => () => {},
      iterate: async function* () {},
      dispose: () => {},
    };
  },
}));

jest.mock('@/metadata-store/hooks/useResyncMetadataStore', () => ({
  useResyncMetadataStore: () => ({ resyncMetadataStore: jest.fn() }),
}));

const renderSseClient = () => {
  const store = createStore();

  store.set(isCookieAuthActiveState.atom, true);

  render(
    createElement(Provider, { store }, createElement(SSEClientEffect, null)),
  );

  expect(createClientMock).toHaveBeenCalledTimes(1);

  return createClientMock.mock.calls[0]?.[0] as ClientOptions;
};

describe('SSEClientEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // The session cookie travels with the request, so the stream needs no header
  // of its own.
  it('should authenticate the stream with the session cookie alone', () => {
    const options = renderSseClient();

    expect(options).toMatchObject({
      url: `${REACT_APP_SERVER_BASE_URL}/metadata`,
      credentials: 'include',
      retryAttempts: Infinity,
    });
    expect(options.headers).toBeUndefined();
  });
});
