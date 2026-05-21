import { useQuery } from '@apollo/client/react';
import { renderHook } from '@testing-library/react';

import { useReplyConnectedAccount } from '@/activities/emails/hooks/useReplyConnectedAccount';
import {
  MyConnectedAccountsDocument,
  MyMessageChannelsDocument,
} from '~/generated-metadata/graphql';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const mockUseQuery = useQuery as unknown as jest.Mock;

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useQuery: jest.fn(),
}));

const stubQueries = (
  channels: { id: string; connectedAccountId: string }[],
  accounts: {
    id: string;
    handle: string;
    provider: ConnectedAccountProvider;
  }[],
) => {
  mockUseQuery.mockImplementation((query: unknown) => {
    if (query === MyConnectedAccountsDocument) {
      return { data: { myConnectedAccounts: accounts }, loading: false };
    }
    if (query === MyMessageChannelsDocument) {
      return { data: { myMessageChannels: channels }, loading: false };
    }
    return { data: undefined, loading: false };
  });
};

describe('useReplyConnectedAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the account that owns the given channel, not the first connected account', () => {
    stubQueries(
      [
        { id: 'channel-google', connectedAccountId: 'account-google' },
        { id: 'channel-imap', connectedAccountId: 'account-imap' },
      ],
      [
        {
          id: 'account-google',
          handle: 'google@example.com',
          provider: ConnectedAccountProvider.GOOGLE,
        },
        {
          id: 'account-imap',
          handle: 'imap@example.com',
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        },
      ],
    );

    const { result } = renderHook(() =>
      useReplyConnectedAccount('channel-imap'),
    );

    expect(result.current).toEqual({
      connectedAccountId: 'account-imap',
      connectedAccountHandle: 'imap@example.com',
      connectedAccountProvider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      loading: false,
    });
  });

  it('returns null when the thread channel is not accessible to the current user', () => {
    stubQueries(
      [{ id: 'channel-google', connectedAccountId: 'account-google' }],
      [
        {
          id: 'account-google',
          handle: 'google@example.com',
          provider: ConnectedAccountProvider.GOOGLE,
        },
      ],
    );

    const { result } = renderHook(() =>
      useReplyConnectedAccount('channel-not-mine'),
    );

    expect(result.current.connectedAccountId).toBeNull();
    expect(result.current.connectedAccountHandle).toBeNull();
    expect(result.current.connectedAccountProvider).toBeNull();
  });
});
