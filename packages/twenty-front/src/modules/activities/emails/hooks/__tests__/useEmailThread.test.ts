import { renderHook } from '@testing-library/react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';

const mockUseFindManyRecords = jest.fn();
const mockUseAtomFamilyStateValue = jest.fn();

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: (args: { objectNameSingular: string }) =>
    mockUseFindManyRecords(args),
}));

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: () => ({ record: THREAD, loading: false }),
}));

jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({ upsertRecordsInStore: jest.fn() }),
}));

jest.mock('@/settings/accounts/hooks/useMyMessageChannels', () => ({
  useMyMessageChannels: () => ({ channels: [{ id: 'channel-id' }] }),
}));

jest.mock('@/activities/emails/hooks/useReplyConnectedAccount', () => ({
  useReplyConnectedAccount: () => ({
    connectedAccountId: null,
    connectedAccountHandle: null,
    connectedAccountProvider: null,
    loading: false,
  }),
}));

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => false,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue', () => ({
  useAtomFamilyStateValue: () => mockUseAtomFamilyStateValue(),
}));

const THREAD = { id: 'thread-id' };

const buildMessage = (id: string) => ({ id, messageParticipants: [] });

const stubQueries = ({
  messages,
  messagesLoading = false,
  associations,
}: {
  messages: ReturnType<typeof buildMessage>[];
  messagesLoading?: boolean;
  associations: { id: string; messageId: string; messageChannelId: string }[];
}) => {
  mockUseFindManyRecords.mockImplementation(
    ({ objectNameSingular }: { objectNameSingular: string }) => {
      if (objectNameSingular === StandardObjectNameSingular.Message) {
        return {
          records: messages,
          loading: messagesLoading,
          hasNextPage: false,
          fetchMoreRecords: jest.fn(),
          refetch: jest.fn(),
          queryIdentifier: 'messages-query',
        };
      }

      if (
        objectNameSingular ===
        StandardObjectNameSingular.MessageChannelMessageAssociation
      ) {
        return { records: associations, loading: associations.length === 0 };
      }

      return { records: [], loading: false };
    },
  );
};

describe('useEmailThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAtomFamilyStateValue.mockReturnValue(false);
  });

  it('keeps the reply channel while the association of a new last message loads', () => {
    stubQueries({
      messages: [buildMessage('message-1')],
      associations: [
        {
          id: 'association-1',
          messageId: 'message-1',
          messageChannelId: 'channel-id',
        },
      ],
    });

    const { result, rerender } = renderHook(() => useEmailThread('thread-id'));

    expect(result.current.lastMessageChannelId).toBe('channel-id');

    stubQueries({
      messages: [buildMessage('message-1'), buildMessage('message-2')],
      associations: [],
    });

    rerender();

    expect(result.current.lastMessageChannelId).toBe('channel-id');
  });

  it('does not carry the reply channel of the previous thread over to a new one', () => {
    stubQueries({
      messages: [buildMessage('message-1')],
      associations: [
        {
          id: 'association-1',
          messageId: 'message-1',
          messageChannelId: 'channel-id',
        },
      ],
    });

    const { result, rerender } = renderHook(
      ({ threadId }) => useEmailThread(threadId),
      { initialProps: { threadId: 'thread-id' } },
    );

    expect(result.current.lastMessageChannelId).toBe('channel-id');

    stubQueries({
      messages: [buildMessage('other-thread-message')],
      associations: [
        {
          id: 'association-1',
          messageId: 'message-1',
          messageChannelId: 'channel-id',
        },
      ],
    });

    rerender({ threadId: 'other-thread-id' });

    expect(result.current.lastMessageChannelId).toBeNull();
  });

  it('only reports fetching more messages during pagination, not during a refetch', () => {
    stubQueries({
      messages: [buildMessage('message-1')],
      messagesLoading: true,
      associations: [],
    });

    const { result, rerender } = renderHook(() => useEmailThread('thread-id'));

    expect(result.current.threadLoading).toBe(true);
    expect(result.current.isFetchingMoreMessages).toBe(false);

    mockUseAtomFamilyStateValue.mockReturnValue(true);

    rerender();

    expect(result.current.isFetchingMoreMessages).toBe(true);
  });
});
