import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ChatThreadWidgetContent } from '@/page-layout/widgets/email-thread/components/ChatThreadWidgetContent';

const THREAD_ID = 'thread-1';
const MEMBER_ID = 'member-1';

const mockSendAppChannelMessage = jest.fn();
const mockRefetchQueries = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ refetchQueries: mockRefetchQueries }),
}));

jest.mock('@/activities/emails/hooks/useSendAppChannelMessage', () => ({
  useSendAppChannelMessage: () => ({
    sendAppChannelMessage: mockSendAppChannelMessage,
  }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

jest.mock('@/activities/emails/hooks/useUploadEmailAttachment', () => ({
  useUploadEmailAttachment: () => ({ uploadEmailAttachment: jest.fn() }),
}));

jest.mock('@/activities/emails/hooks/useReplyConnectedAccount', () => ({
  useReplyConnectedAccount: () => ({
    messageChannel: {
      id: 'channel-1',
      isSyncEnabled: true,
      messagingProviderUniversalIdentifier: 'whatsapp-messaging',
    },
    connectedAccount: {
      id: 'account-1',
      authFailedAt: null,
      archivedAt: null,
      applicationId: 'application-1',
      connectionProviderId: 'provider-1',
    },
  }),
}));

jest.mock(
  '@/settings/app-preferences/hooks/useApplicationsWithPreferences',
  () => ({
    useApplicationsWithPreferences: () => ({
      applicationsWithPreferences: [
        {
          connectionProviders: [
            { id: 'provider-1', name: 'whatsapp', displayName: 'WhatsApp' },
          ],
        },
      ],
    }),
  }),
);

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => true,
}));

jest.mock('@/activities/emails/hooks/useChatThreadCounterparts', () => ({
  useChatThreadCounterparts: () => [],
}));

jest.mock('@/activities/emails/components/ChatThreadMessages', () => ({
  ChatThreadMessages: () => null,
}));

jest.mock('@/page-layout/widgets/components/WidgetRelationsHeader', () => ({
  WidgetRelationsHeader: () => null,
}));

jest.mock('@/activities/components/CustomResolverFetchMoreLoader', () => ({
  CustomResolverFetchMoreLoader: () => null,
}));

const renderContent = () => {
  const store = createStore();

  store.set(currentWorkspaceMemberState.atom, {
    id: MEMBER_ID,
  } as never);

  return render(
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <ChatThreadWidgetContent
          messageThreadId={THREAD_ID}
          messages={[]}
          loading={false}
          onFetchMoreMessages={jest.fn()}
          messageChannelId="channel-1"
          onMessageSent={jest.fn().mockResolvedValue(undefined)}
        />
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('ChatThreadWidgetContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('shows a failed send without waiting for the account refresh', async () => {
    mockSendAppChannelMessage.mockRejectedValueOnce(new Error('Rejected'));
    mockRefetchQueries.mockReturnValue(new Promise(() => undefined));

    renderContent();

    await userEvent.type(screen.getByRole('textbox'), 'Hello{Enter}');

    expect(await screen.findByText('Sending failed')).toBeVisible();
    expect(mockRefetchQueries).toHaveBeenCalledTimes(1);
  });

  it('keeps each member draft separate on the same thread', async () => {
    renderContent();

    await userEvent.type(screen.getByRole('textbox'), 'Draft');

    expect(
      sessionStorage.getItem(
        `activities/chatThreadComposerDraftFamilyState__${MEMBER_ID}:${THREAD_ID}`,
      ),
    ).toBe(JSON.stringify('Draft'));
  });
});
