import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { myConnectedAccountsState } from '@/accounts/states/myConnectedAccountsState';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { EmptyInboxPlaceholder } from '@/activities/emails/components/EmptyInboxPlaceholder';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockNavigateSettings = jest.fn();
let mockMessageChannels: { connectedAccountId: string }[] = [];
let mockMessageChannelsLoading = false;

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({
    id: '20202020-0000-4000-8000-000000000001',
    targetObjectNameSingular: 'company',
  }),
}));

jest.mock('@/activities/emails/hooks/useComposeEmailForTargetRecord', () => ({
  useComposeEmailForTargetRecord: () => ({
    openComposer: jest.fn(),
    loading: false,
  }),
}));

jest.mock('@/settings/accounts/hooks/useMyMessageChannels', () => ({
  useMyMessageChannels: () => ({
    channels: mockMessageChannels,
    loading: mockMessageChannelsLoading,
  }),
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => mockNavigateSettings,
}));

jest.mock('@/activities/emails/components/LinkEmailThreadsDropdown', () => ({
  LinkEmailThreadsDropdown: ({ trigger }: { trigger: React.ReactNode }) =>
    trigger,
}));

type MyConnectedAccount = Omit<
  ConnectedAccount,
  'messageChannels' | 'calendarChannels'
>;

const whatsappAccount: MyConnectedAccount = {
  id: 'account-whatsapp',
  handle: '+33600000000',
  provider: ConnectedAccountProvider.APP,
  authFailedAt: null,
  authFailedReason: null,
  archivedAt: null,
  scopes: null,
  handleAliases: null,
  lastSignedInAt: null,
  userWorkspaceId: 'user-workspace-id',
  connectionProviderId: 'connection-provider-id',
  applicationId: 'application-id',
  name: null,
  scope: 'USER',
  lastCredentialsRefreshedAt: null,
  connectionParameters: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  __typename: 'ConnectedAccount',
};

const renderPlaceholder = (myConnectedAccounts: MyConnectedAccount[] | null) =>
  render(
    <I18nProvider i18n={i18n}>
      <EmptyInboxPlaceholder />
    </I18nProvider>,
    {
      wrapper: getJestMetadataAndApolloMocksWrapper({
        onInitializeJotaiStore: (store) => {
          store.set(myConnectedAccountsState.atom, myConnectedAccounts);
        },
      }),
    },
  );

describe('EmptyInboxPlaceholder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMessageChannels = [];
    mockMessageChannelsLoading = false;
  });

  it('asks to connect an account when none is connected', async () => {
    renderPlaceholder([]);

    expect(screen.getByText('No messages yet')).toBeVisible();
    expect(
      screen.getByText(
        'Connect email, WhatsApp or LinkedIn to see your conversations here.',
      ),
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'Connect an account' }),
    );

    expect(mockNavigateSettings).toHaveBeenCalledTimes(1);
  });

  it('does not ask to connect an account when a messaging account already works', () => {
    mockMessageChannels = [{ connectedAccountId: whatsappAccount.id }];

    renderPlaceholder([whatsappAccount]);

    expect(screen.getByText('No messages yet')).toBeVisible();
    expect(
      screen.getByText('Your conversations will show up here.'),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Connect an account' }),
    ).not.toBeInTheDocument();
  });

  it('asks to connect an account when the only one is disconnected', () => {
    mockMessageChannels = [{ connectedAccountId: whatsappAccount.id }];

    renderPlaceholder([
      { ...whatsappAccount, authFailedAt: '2026-11-01T00:00:00.000Z' },
    ]);

    expect(
      screen.getByRole('button', { name: 'Connect an account' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Link email threads' }),
    ).not.toBeInTheDocument();
  });

  it('waits for the accounts and their channels before showing anything', () => {
    mockMessageChannelsLoading = true;

    const { rerender } = renderPlaceholder([whatsappAccount]);

    expect(screen.queryByText('No messages yet')).not.toBeInTheDocument();

    mockMessageChannelsLoading = false;
    rerender(
      <I18nProvider i18n={i18n}>
        <EmptyInboxPlaceholder />
      </I18nProvider>,
    );

    expect(screen.getByText('No messages yet')).toBeVisible();
  });
});
