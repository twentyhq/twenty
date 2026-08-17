import { render } from '@testing-library/react';
import { type ClientOptions } from 'graphql-sse';
import { createStore, Provider } from 'jotai';
import { createElement } from 'react';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { SSEClientEffect } from '@/sse-db-event/components/SSEClientEffect';
import { type AuthTokenPair } from '~/generated-metadata/graphql';

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

const TOKEN_PAIR: AuthTokenPair = {
  accessOrWorkspaceAgnosticToken: {
    token: 'access-token',
    expiresAt: new Date().toISOString(),
  },
  refreshToken: {
    token: 'refresh-token',
    expiresAt: new Date().toISOString(),
  },
};

const renderWithAuthMode = (isCookieAuthActive: boolean) => {
  const store = createStore();

  store.set(tokenPairState.atom, TOKEN_PAIR);
  store.set(isCookieAuthActiveState.atom, isCookieAuthActive);

  render(
    createElement(Provider, { store }, createElement(SSEClientEffect, null)),
  );

  const options = createClientMock.mock.calls[0]?.[0] as ClientOptions;

  return options.headers as () => Record<string, string>;
};

describe('SSEClientEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should attach the Bearer header when the client authenticates by token', () => {
    const headers = renderWithAuthMode(false);

    expect(headers()).toEqual({ Authorization: 'Bearer access-token' });
  });

  // The server prefers Bearer over the session cookie, so a dormant token here
  // would authenticate the stream with a credential nothing refreshes.
  it('should not attach the Bearer header while cookie auth is active', () => {
    const headers = renderWithAuthMode(true);

    expect(headers()).toEqual({});
  });
});
