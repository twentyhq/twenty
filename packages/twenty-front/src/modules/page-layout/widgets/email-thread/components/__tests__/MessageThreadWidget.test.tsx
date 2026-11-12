import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { MessageThreadWidget } from '@/page-layout/widgets/email-thread/components/MessageThreadWidget';
import { MessageChannelType } from '~/generated/graphql';

const mockUseMessageThreadChannel = jest.fn();
const mockUseEmailThread = jest.fn();
const mockUseSubscribeToMessageThreadMessages = jest.fn();
const mockRefetchMessages = jest.fn();

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({ id: 'thread-id' }),
}));

jest.mock('@/activities/emails/hooks/useEmailThread', () => ({
  useEmailThread: () => mockUseEmailThread(),
}));

jest.mock('@/activities/emails/hooks/useMessageThreadChannel', () => ({
  useMessageThreadChannel: () => mockUseMessageThreadChannel(),
}));

jest.mock(
  '@/activities/emails/hooks/useSubscribeToMessageThreadMessages',
  () => ({
    useSubscribeToMessageThreadMessages: (
      ...args: Parameters<typeof mockUseSubscribeToMessageThreadMessages>
    ) => mockUseSubscribeToMessageThreadMessages(...args),
  }),
);

jest.mock(
  '@/page-layout/widgets/email-thread/components/ChatThreadWidgetContent',
  () => ({
    ChatThreadWidgetContent: ({ loading }: { loading: boolean }) => (
      <div>
        Chat thread
        {loading && <span>Loading more...</span>}
      </div>
    ),
  }),
);

jest.mock(
  '@/page-layout/widgets/email-thread/components/EmailThreadWidgetContent',
  () => ({ EmailThreadWidgetContent: () => <div>Email thread</div> }),
);

const renderWidget = () =>
  render(
    <I18nProvider i18n={i18n}>
      <MessageThreadWidget widget={{} as PageLayoutWidget} />
    </I18nProvider>,
  );

const mockThread = ({
  threadLoading = false,
  isFetchingMoreMessages = false,
} = {}) =>
  mockUseEmailThread.mockReturnValue({
    thread: { id: 'thread-id' },
    messages: [{ id: 'message-id' }],
    fetchMoreMessages: jest.fn(),
    refetchMessages: mockRefetchMessages,
    threadLoading,
    isFetchingMoreMessages,
  });

const mockChannel = (type: MessageChannelType) =>
  mockUseMessageThreadChannel.mockReturnValue({
    messageThreadChannel: {
      type,
      provider: 'app',
      applicationId: null,
      conversationStyle: type === MessageChannelType.APP ? 'chat' : 'email',
    },
    messageThreadChannelLoading: false,
  });

describe('MessageThreadWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThread();
  });

  it('renders app threads as a chat', () => {
    mockChannel(MessageChannelType.APP);

    renderWidget();

    expect(screen.getByText('Chat thread')).toBeInTheDocument();
  });

  it('subscribes to new messages of the thread', () => {
    mockChannel(MessageChannelType.APP);

    renderWidget();

    expect(mockUseSubscribeToMessageThreadMessages).toHaveBeenCalledTimes(1);
    expect(mockUseSubscribeToMessageThreadMessages).toHaveBeenCalledWith({
      messageThreadId: 'thread-id',
      loadedMessageIds: ['message-id'],
      refetchMessages: mockRefetchMessages,
    });
  });

  it.each([MessageChannelType.EMAIL, MessageChannelType.SMS])(
    'renders %s threads as an email thread',
    (type) => {
      mockChannel(type);

      renderWidget();

      expect(screen.getByText('Email thread')).toBeInTheDocument();
    },
  );

  it('keeps the thread on screen while the next page of messages loads', () => {
    mockThread({ threadLoading: true });
    mockChannel(MessageChannelType.APP);

    renderWidget();

    expect(screen.getByText('Chat thread')).toBeInTheDocument();
    expect(screen.queryByText('Loading thread')).not.toBeInTheDocument();
  });

  it('does not show the fetch-more loader in a chat while messages are refetched', () => {
    mockThread({ threadLoading: true });
    mockChannel(MessageChannelType.APP);

    renderWidget();

    expect(screen.queryByText('Loading more...')).not.toBeInTheDocument();
  });

  it('shows the fetch-more loader in a chat while the next page loads', () => {
    mockThread({ threadLoading: true, isFetchingMoreMessages: true });
    mockChannel(MessageChannelType.APP);

    renderWidget();

    expect(screen.getByText('Loading more...')).toBeInTheDocument();
  });
});
