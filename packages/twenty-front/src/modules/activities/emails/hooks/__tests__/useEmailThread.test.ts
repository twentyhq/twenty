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
const mockUseUpsertRecordsInStore = jest.fn();
const mockUseQuery = useQuery as unknown as jest.Mock;

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useQuery: jest.fn(),
}));

jest.mock(
  '@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory',
  () => ({
    fetchAllThreadMessagesOperationSignatureFactory: () => ({
      objectNameSingular: CoreObjectNameSingular.Message,
      variables: {
        limit: 20,
        filter: {},
        orderBy: [{ receivedAt: 'DescNullsLast' }],
      },
      fields: {
        id: true,
        subject: true,
        receivedAt: true,
        text: true,
        headerMessageId: true,
        messageThreadId: true,
      },
    }),
  }),
);

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: (args: unknown) => mockUseFindOneRecord(args),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (args: unknown) => mockUseFindManyRecords(args),
}));

jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => mockUseUpsertRecordsInStore(),
}));

describe('useEmailThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUpsertRecordsInStore.mockReturnValue({
      upsertRecordsInStore: jest.fn(),
    });

    mockUseFindOneRecord.mockReturnValue({
      record: { id: 'thread-id' },
    });

    mockUseFindManyRecords.mockImplementation(
      (args: {
        objectNameSingular: string;
        filter?: { role?: { eq?: string } };
        skip?: boolean;
      }) => {
        if (args.skip === true) {
          return {
            records: [],
            loading: false,
            fetchMoreRecords: jest.fn(),
            hasNextPage: false,
          };
        }

        if (args.objectNameSingular === CoreObjectNameSingular.Message) {
          return {
            records: [
              {
                id: 'message-id',
                subject: 'Hello',
                receivedAt: '2026-05-20T00:00:00.000Z',
                text: 'body',
                headerMessageId: 'message-header-id',
                messageThreadId: 'thread-id',
              },
            ],
            loading: false,
            fetchMoreRecords: jest.fn(),
            hasNextPage: false,
          };
        }

        if (
          args.objectNameSingular ===
            CoreObjectNameSingular.MessageParticipant &&
          args.filter?.role?.eq === MessageParticipantRole.FROM
        ) {
          return {
            records: [
              {
                id: 'participant-id',
                role: MessageParticipantRole.FROM,
                displayName: 'Sender',
                messageId: 'message-id',
                handle: 'sender@example.com',
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
            records: [
              {
                __typename: 'MessageChannelMessageAssociation',
                id: 'association-id',
                messageId: 'message-id',
                messageChannelId: 'thread-channel-id',
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
          fetchMoreRecords: jest.fn(),
          hasNextPage: false,
        };
      },
    );

    mockUseQuery.mockImplementation((query: unknown) => {
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
                id: 'wrong-channel-id',
                connectedAccountId: 'wrong-account-id',
              },
              {
                id: 'thread-channel-id',
                connectedAccountId: 'thread-account-id',
              },
            ],
          },
          loading: false,
        };
      }

      return {
        data: undefined,
        loading: false,
      };
    });
  });

  it('resolves the reply account from the thread message channel instead of the first account', async () => {
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
