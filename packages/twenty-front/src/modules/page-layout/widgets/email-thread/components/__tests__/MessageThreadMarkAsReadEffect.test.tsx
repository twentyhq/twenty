import { render } from '@testing-library/react';

import { MessageThreadMarkAsReadEffect } from '@/page-layout/widgets/email-thread/components/MessageThreadMarkAsReadEffect';

const mockMarkAppChannelThreadAsRead = jest.fn();
const mockUseReplyConnectedAccount = jest.fn();
const mockHasSendPermission = jest.fn();

jest.mock('@/activities/emails/hooks/useMarkAppChannelThreadAsRead', () => ({
  useMarkAppChannelThreadAsRead: () => ({
    markAppChannelThreadAsRead: mockMarkAppChannelThreadAsRead,
  }),
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

const renderEffect = () =>
  render(
    <MessageThreadMarkAsReadEffect
      messageChannelId="channel-id"
      messageThreadId="thread-id"
    />,
  );

describe('MessageThreadMarkAsReadEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasSendPermission.mockReturnValue(true);
    mockChannel();
  });

  it('marks the thread as read once when its channel owner opens it', () => {
    const { rerender } = renderEffect();

    rerender(
      <MessageThreadMarkAsReadEffect
        messageChannelId="channel-id"
        messageThreadId="thread-id"
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

    renderEffect();

    expect(mockMarkAppChannelThreadAsRead).not.toHaveBeenCalled();
  });

  it('does not mark the thread as read without the permission to send', () => {
    mockHasSendPermission.mockReturnValue(false);

    renderEffect();

    expect(mockMarkAppChannelThreadAsRead).not.toHaveBeenCalled();
  });

  it('does not mark the thread as read on a channel without a messaging provider', () => {
    mockChannel({ messagingProviderUniversalIdentifier: null });

    renderEffect();

    expect(mockMarkAppChannelThreadAsRead).not.toHaveBeenCalled();
  });
});
