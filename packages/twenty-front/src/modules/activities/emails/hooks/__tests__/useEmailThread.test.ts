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
const mockUseQuery = useQuery as jest.Mock;

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useQuery: jest.fn(),
}));

jest.mock('@/activities/emails/graphql/operation-signatures/factories/fetchAllThreadMessagesOperationSignatureFactory', () => ({
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
}));

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
      record: { id: 'thread-1' },
    });

    mockUseFindManyRecords.mockImplementation(
      (args: { objectNameSingular: string; filter?: { role?: { eq?: string } } }) => {
        if (args.objectNameSingular === CoreObjectNameSingular.Message) {
          return {
            records: [
              {
                id: 'message-1',
                subject: 'Subject',
                receivedAt: '2024-01-01T00:00:00.000Z',
                text: 'text',
                headerMessageId: 'header-id',
                messageThreadId: 'thread-1',
                messageParticipants: [],
                messageThread: { id: 'thread-1' },
              },
            ],
            loading: false,
            fetchMoreRecords: jest.fn(),
            hasNextPage: false,
          };
        }

        if (
          args.objectNameSingular === CoreObjectNameSingular.MessageParticipant &&
          args.filter?.role?.eq === MessageParticipantRole.FROM
        ) {
          return {
            records: [
              {
                id: 'participant-1',
                role: MessageParticipantRole.FROM,
                messageId: 'message-1',
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
                id: 'association-1',
                messageId: 'message-1',
                messageChannelId: 'channel-2',
                messageThreadExternalId: 'thread-ext',
                messageExternalId: 'message-ext',
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

    mockUseQuery.mockImplementation((query: unknown) => {
      if (query === GET_MY_CONNECTED_ACCOUNTS) {
        return {
          data: {
            myConnectedAccounts: [
              {
                id: 'account-1',
                handle: 'first@example.com',
                provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
              },
              {
                id: 'account-2',
                handle: 'second@example.com',
                provider: ConnectedAccountProvider.GOOGLE,
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
                connectedAccountId: 'account-1',
              },
              {
                id: 'channel-2',
                connectedAccountId: 'account-2',
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

  it('should resolve connected account from the thread message channel', async () => {
    const { result } = renderHook(() => useEmailThread('thread-1'));

    await waitFor(() => {
      expect(result.current.connectedAccountId).toBe('account-2');
    });

    expect(result.current.connectedAccountHandle).toBe('second@example.com');
    expect(result.current.connectedAccountProvider).toBe(
      ConnectedAccountProvider.GOOGLE,
    );
  });
});
