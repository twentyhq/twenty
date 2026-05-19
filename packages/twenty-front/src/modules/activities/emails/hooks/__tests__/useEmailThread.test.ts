import { useQuery } from '@apollo/client/react';
import { renderHook, waitFor } from '@testing-library/react';

import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import {
  ConnectedAccountProvider,
  CoreObjectNameSingular,
  MessageParticipantRole,
} from 'twenty-shared/types';

const mockUseFindOneRecord = jest.fn();
const mockUseFindManyRecords = jest.fn();
const mockUpsertRecordsInStore = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: (args: unknown) => mockUseFindOneRecord(args),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (args: unknown) => mockUseFindManyRecords(args),
}));

jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({
    upsertRecordsInStore: mockUpsertRecordsInStore,
  }),
}));

describe('useEmailThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFindOneRecord.mockReturnValue({
      record: { id: 'thread-id' },
      loading: false,
    });

    mockUseFindManyRecords.mockImplementation(
      (args: { objectNameSingular: string; skip?: boolean }) => {
        if (
          args.objectNameSingular === CoreObjectNameSingular.MessageThread ||
          args.objectNameSingular === CoreObjectNameSingular.Message
        ) {
          return {
            records: [
              {
                id: 'message-1',
                subject: 'Thread',
                headerMessageId: 'header-1',
              },
              {
                id: 'message-2',
                subject: 'Thread',
                headerMessageId: 'header-2',
              },
            ],
            loading: false,
            fetchMoreRecords: jest.fn(),
            hasNextPage: false,
          };
        }

        if (
          args.objectNameSingular === CoreObjectNameSingular.MessageParticipant
        ) {
          return {
            records: [
              {
                id: 'sender-1',
                messageId: 'message-1',
                role: MessageParticipantRole.FROM,
                handle: 'first@example.com',
              },
              {
                id: 'sender-2',
                messageId: 'message-2',
                role: MessageParticipantRole.FROM,
                handle: 'second@example.com',
              },
            ],
            loading: false,
          };
        }

        if (
          args.objectNameSingular ===
          CoreObjectNameSingular.MessageChannelMessageAssociation
        ) {
          return {
            records: args.skip
              ? []
              : [
                  {
                    id: 'association-id',
                    messageId: 'message-2',
                    messageChannelId: 'channel-2',
                    messageThreadExternalId: 'thread-external-id',
                    messageExternalId: 'message-external-id',
                  },
                ],
            loading: false,
          };
        }

        return {
          records: [],
          loading: false,
        };
      },
    );

    (useQuery as unknown as jest.Mock).mockImplementation((query) => {
      if (query === GET_MY_CONNECTED_ACCOUNTS) {
        return {
          data: {
            myConnectedAccounts: [
              {
                id: 'wrong-account-id',
                handle: 'wrong@example.com',
                provider: ConnectedAccountProvider.GOOGLE,
              },
              {
                id: 'thread-account-id',
                handle: 'thread@example.com',
                provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
              },
            ],
          },
          loading: false,
        };
      }

      if (query === GET_MY_MESSAGE_CHANNELS) {
        return {
          data: {
            myMessageChannels: [
              {
                id: 'channel-1',
                connectedAccountId: 'wrong-account-id',
              },
              {
                id: 'channel-2',
                connectedAccountId: 'thread-account-id',
              },
            ],
          },
          loading: false,
        };
      }

      return { data: undefined, loading: false };
    });
  });

  it('resolves the connected account from the thread message channel', async () => {
    const { result } = renderHook(() => useEmailThread('thread-id'));

    await waitFor(() => {
      expect(result.current.connectedAccountId).toBe('thread-account-id');
    });

    expect(result.current.connectedAccountHandle).toBe('thread@example.com');
    expect(result.current.connectedAccountProvider).toBe(
      ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    );
  });
});
