import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { ApplicationConnectedAccountsDocument } from '~/generated-metadata/graphql';
import { APP_CONNECTION_ON_CONNECT_REFETCH } from '~/pages/settings/applications/constants/AppConnectionOnConnectRefetch';
import {
  type ApplicationConnectedAccount,
  useApplicationConnectedAccounts,
} from '~/pages/settings/applications/hooks/useApplicationConnectedAccounts';

const APPLICATION_ID = 'app-1';

const buildConnection = ({
  id,
  lastCredentialsRefreshedAt,
}: {
  id: string;
  lastCredentialsRefreshedAt: string | null;
}): ApplicationConnectedAccount => ({
  __typename: 'ApplicationConnectedAccountDTO',
  id,
  handle: `${id}@example.com`,
  authFailedAt: null,
  authFailedReason: null,
  scopes: ['read'],
  lastSignedInAt: null,
  connectionProviderId: 'provider-1',
  name: id,
  visibility: 'workspace',
  lastCredentialsRefreshedAt,
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
});

const renderConnectedAccounts = (
  responses: ApplicationConnectedAccount[][],
) => {
  const mocks = responses.map((applicationConnectedAccounts) => ({
    request: {
      query: ApplicationConnectedAccountsDocument,
      variables: { applicationId: APPLICATION_ID },
    },
    result: { data: { applicationConnectedAccounts } },
  }));

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

  return renderHook(() => useApplicationConnectedAccounts(APPLICATION_ID), {
    wrapper,
  });
};

const connectionIds = (accounts: ApplicationConnectedAccount[]) =>
  accounts.map(({ id }) => id);

describe('useApplicationConnectedAccounts', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the merge done by onConnect after a connection was just saved', async () => {
    const justSavedAt = new Date().toISOString();
    const { result } = renderConnectedAccounts([
      [
        buildConnection({ id: 'existing', lastCredentialsRefreshedAt: null }),
        buildConnection({
          id: 'duplicate',
          lastCredentialsRefreshedAt: justSavedAt,
        }),
      ],
      [
        buildConnection({
          id: 'existing',
          lastCredentialsRefreshedAt: justSavedAt,
        }),
      ],
    ]);

    await waitFor(() =>
      expect(connectionIds(result.current.accounts)).toEqual([
        'existing',
        'duplicate',
      ]),
    );

    await act(async () => {
      jest.advanceTimersByTime(
        APP_CONNECTION_ON_CONNECT_REFETCH.refetchDelayInMs,
      );
    });

    await waitFor(() =>
      expect(connectionIds(result.current.accounts)).toEqual(['existing']),
    );
  });

  it('does not refetch when no connection was saved recently', async () => {
    const { result } = renderConnectedAccounts([
      [buildConnection({ id: 'existing', lastCredentialsRefreshedAt: null })],
      [],
    ]);

    await waitFor(() =>
      expect(connectionIds(result.current.accounts)).toEqual(['existing']),
    );

    await act(async () => {
      jest.advanceTimersByTime(
        APP_CONNECTION_ON_CONNECT_REFETCH.refetchDelayInMs * 2,
      );
    });

    expect(connectionIds(result.current.accounts)).toEqual(['existing']);
  });
});
