import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { WidgetActionMessageCompose } from '@/page-layout/widgets/messages/components/WidgetActionMessageCompose';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const PERSON_ID = '20202020-0000-4000-8000-000000000001';

const openComposer = jest.fn();
const openComposerWithConnectedAccount = jest.fn();
let mockComposerLoading = false;

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({
    id: PERSON_ID,
    targetObjectNameSingular: 'person',
  }),
}));

jest.mock('@/activities/emails/hooks/useComposeEmailForTargetRecord', () => ({
  useComposeEmailForTargetRecord: () => ({
    openComposer,
    openComposerWithConnectedAccount,
    loading: mockComposerLoading,
  }),
}));

jest.mock('@/activities/emails/components/MessageChannelLogo', () => ({
  MessageChannelLogo: ({ channel }: { channel: { provider: string } }) => (
    <span>{channel.provider}</span>
  ),
}));

type MyConnectedAccount = Omit<
  ConnectedAccount,
  'messageChannels' | 'calendarChannels'
>;

const buildAccount = (
  overrides: Partial<MyConnectedAccount> &
    Pick<MyConnectedAccount, 'id' | 'handle' | 'provider'>,
): MyConnectedAccount => ({
  authFailedAt: null,
  authFailedReason: null,
  archivedAt: null,
  scopes: null,
  handleAliases: null,
  lastSignedInAt: null,
  userWorkspaceId: 'user-workspace-id',
  connectionProviderId: null,
  applicationId: null,
  name: null,
  scope: 'USER',
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  __typename: 'ConnectedAccount',
  ...overrides,
});

const googleAccount = buildAccount({
  id: 'account-google',
  handle: 'tim@gmail.com',
  provider: ConnectedAccountProvider.GOOGLE,
});

const microsoftAccount = buildAccount({
  id: 'account-microsoft',
  handle: 'tim@outlook.com',
  provider: ConnectedAccountProvider.MICROSOFT,
});

const imapWithoutSmtpAccount = buildAccount({
  id: 'account-imap',
  handle: 'tim@imap.example.com',
  provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
  connectionParameters: {
    IMAP: { host: 'imap.example.com', port: 993 },
  },
});

const renderAction = (myConnectedAccounts: MyConnectedAccount[] | null) =>
  render(
    <I18nProvider i18n={i18n}>
      <WidgetActionMessageCompose />
    </I18nProvider>,
    {
      wrapper: getJestMetadataAndApolloMocksWrapper({
        onInitializeJotaiStore: (store) => {
          store.set(myConnectedAccountsState.atom, myConnectedAccounts);
        },
      }),
    },
  );

describe('WidgetActionMessageCompose', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockComposerLoading = false;
  });

  it('lets the user pick which account the new message is sent from', async () => {
    const user = userEvent.setup();

    renderAction([googleAccount, imapWithoutSmtpAccount, microsoftAccount]);

    await user.click(screen.getByRole('button', { name: 'New message' }));

    const menu = await screen.findByRole('menu', { name: 'Send from' });

    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    expect(
      screen.getByRole('menuitem', { name: /tim@gmail\.com/ }),
    ).toHaveTextContent('google');
    expect(
      screen.getByRole('menuitem', { name: /tim@outlook\.com/ }),
    ).toHaveTextContent('microsoft');
    expect(
      screen.queryByRole('menuitem', { name: /imap\.example\.com/ }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('menuitem', { name: /tim@outlook\.com/ }),
    );

    expect(openComposerWithConnectedAccount).toHaveBeenCalledTimes(1);
    expect(openComposerWithConnectedAccount).toHaveBeenCalledWith(
      'account-microsoft',
    );
    expect(openComposer).not.toHaveBeenCalled();
    expect(menu).not.toBeInTheDocument();
  });

  it('falls back to the default compose flow when no account can send', async () => {
    const user = userEvent.setup();

    renderAction([imapWithoutSmtpAccount]);

    await user.click(screen.getByRole('button', { name: 'New message' }));

    expect(openComposer).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('is disabled until the connected accounts are loaded', () => {
    mockComposerLoading = true;

    renderAction(null);

    expect(screen.getByRole('button', { name: 'New message' })).toBeDisabled();
  });
});
