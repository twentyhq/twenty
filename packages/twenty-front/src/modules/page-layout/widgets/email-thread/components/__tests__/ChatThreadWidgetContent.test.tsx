import { render } from '@testing-library/react';

import { ChatThreadWidgetContent } from '@/page-layout/widgets/email-thread/components/ChatThreadWidgetContent';

const mockMarkAppChannelThreadAsRead = jest.fn();
const mockUseReplyConnectedAccount = jest.fn();
const mockHasSendPermission = jest.fn();

jest.mock('@/activities/emails/hooks/useMarkAppChannelThreadAsRead', () => ({
  useMarkAppChannelThreadAsRead: () => ({
    markAppChannelThreadAsRead: mockMarkAppChannelThreadAsRead,
  }),
}));

jest.mock('@/activities/emails/hooks/useSendAppChannelMessage', () => ({
  useSendAppChannelMessage: () => ({ sendAppChannelMessage: jest.fn() }),
}));

jest.mock('@/activities/emails/hooks/useReplyConnectedAccount', () => ({
  useReplyConnectedAccount: () => mockUseReplyConnectedAccount(),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => mockHasSendPermission(),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ userWorkspaceId: 'owner-user-workspace-id' }),
}));

jest.mock(
  '@/settings/app-preferences/hooks/useApplicationsWithPreferences',
  () => ({
    useApplicationsWithPreferences: () => ({ applicationsWithPreferences: [] }),
  }),
);

jest.mock('@/activities/emails/hooks/useChatThreadCounterparts', () => ({
  useChatThreadCounterparts: () => [],
}));

jest.mock('@/activities/emails/hooks/useStickToBottomScroll', () => ({
  useStickToBottomScroll: () => ({
    scrollContainerRef: { current: null },
    handleScroll: jest.fn(),
  }),
}));

jest.mock('@/page-layout/widgets/components/WidgetRelationsHeader', () => ({
  WidgetRelationsHeader: () => null,
}));

jest.mock('@/activities/emails/components/ChatThreadMessages', () => ({
  ChatThreadMessages: () => null,
}));

jest.mock('@/activities/components/CustomResolverFetchMoreLoader', () => ({
  CustomResolverFetchMoreLoader: () => null,
}));

const mockChannel = ({
  ownerUserWorkspaceId = 'owner-user-workspace-id',
  messagingProviderUniversalIdentifier = 'messaging-provider-id',
}: {
  ownerUserWorkspaceId?: string;
  messagingProviderUniversalIdentifier?: string | null;
} = {}) =>
  mockUseReplyConnectedAccount.mockReturnValue({
    messageChannel: {
      id: 'channel-id',
      isSyncEnabled: true,
      messagingProviderUniversalIdentifier,
    },
    connectedAccount: {
      id: 'connected-account-id',
      userWorkspaceId: ownerUserWorkspaceId,
      provider: 'app',
      scope: 'USER',
      authFailedAt: null,
    },
  });

const renderContent = (messageThreadId = 'thread-id') =>
  render(
    <ChatThreadWidgetContent
      messageThreadId={messageThreadId}
      messages={[]}
      loading={false}
      onFetchMoreMessages={jest.fn()}
      messageChannelId="channel-id"
      onMessageSent={jest.fn()}
    />,
  );

describe('ChatThreadWidgetContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasSendPermission.mockReturnValue(true);
    mockChannel();
  });

  it('marks the thread as read once when its channel owner opens it', () => {
    const { rerender } = renderContent();

    rerender(
      <ChatThreadWidgetContent
        messageThreadId="thread-id"
        messages={[]}
        loading={false}
        onFetchMoreMessages={jest.fn()}
        messageChannelId="channel-id"
        onMessageSent={jest.fn()}
      />,
    );

    expect(mockMarkAppChannelThreadAsRead).toHaveBeenCalledTimes(1);
    expect(mockMarkAppChannelThreadAsRead).toHaveBeenCalledWith({
      messageChannelId: 'channel-id',
      messageThreadId: 'thread-id',
    });
  });

  it('does not mark the thread as read for a member the channel is shared with', () => {
    mockChannel({ ownerUserWorkspaceId: 'other-user-workspace-id' });

    renderContent();

    expect(mockMarkAppChannelThreadAsRead).not.toHaveBeenCalled();
  });

  it('does not mark the thread as read without the permission to send', () => {
    mockHasSendPermission.mockReturnValue(false);

    renderContent();

    expect(mockMarkAppChannelThreadAsRead).not.toHaveBeenCalled();
  });

  it('does not mark the thread as read on a channel without a messaging provider', () => {
    mockChannel({ messagingProviderUniversalIdentifier: null });

    renderContent();

    expect(mockMarkAppChannelThreadAsRead).not.toHaveBeenCalled();
  });
});
