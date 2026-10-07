import { SettingsAccountsAccountUsage } from '@/settings/accounts/components/SettingsAccountsAccountUsage';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import {
  ConnectedAccountProvider,
  MessageChannelType,
} from 'twenty-shared/types';
import {
  MOCKED_GOOGLE_CONNECTED_ACCOUNT,
  MOCKED_PAUSED_GOOGLE_ACCOUNT,
} from '~/pages/settings/accounts/__stories__/mockedConnectedAccounts';

it('shows both Gmail and Google Calendar for a connection with both channels', () => {
  render(
    <I18nProvider i18n={i18n}>
      <SettingsAccountsAccountUsage account={MOCKED_GOOGLE_CONNECTED_ACCOUNT} />
    </I18nProvider>,
  );

  expect(screen.getByRole('img', { name: 'Gmail' })).toBeInTheDocument();
  expect(
    screen.getByRole('img', { name: 'Google Calendar' }),
  ).toBeInTheDocument();
});

it('does not treat an app message channel as Gmail usage', () => {
  render(
    <I18nProvider i18n={i18n}>
      <SettingsAccountsAccountUsage
        account={{
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          messageChannels: [
            {
              ...MOCKED_GOOGLE_CONNECTED_ACCOUNT.messageChannels[0],
              type: MessageChannelType.APP,
            },
          ],
        }}
      />
    </I18nProvider>,
  );

  expect(screen.queryByRole('img', { name: 'Gmail' })).not.toBeInTheDocument();
  expect(
    screen.getByRole('img', { name: 'Google Calendar' }),
  ).toBeInTheDocument();
});

it('shows one Outlook indicator for a connection with both channels', () => {
  render(
    <I18nProvider i18n={i18n}>
      <SettingsAccountsAccountUsage
        account={{
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          provider: ConnectedAccountProvider.MICROSOFT,
        }}
      />
    </I18nProvider>,
  );

  expect(screen.getAllByRole('img', { name: 'Outlook' })).toHaveLength(1);
});

it('shows email and calendar usage for an IMAP and CalDAV connection', () => {
  render(
    <I18nProvider i18n={i18n}>
      <SettingsAccountsAccountUsage
        account={{
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        }}
      />
    </I18nProvider>,
  );

  expect(screen.getByRole('img', { name: 'Email' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Calendar' })).toBeInTheDocument();
});

it('retains calendar usage when an account has paused sync', () => {
  render(
    <I18nProvider i18n={i18n}>
      <SettingsAccountsAccountUsage account={MOCKED_PAUSED_GOOGLE_ACCOUNT} />
    </I18nProvider>,
  );

  expect(
    screen.getByRole('img', { name: 'Google Calendar' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('img', { name: 'Gmail' })).not.toBeInTheDocument();
});

it('does not infer usage from the provider alone', () => {
  render(
    <I18nProvider i18n={i18n}>
      <SettingsAccountsAccountUsage
        account={{
          ...MOCKED_GOOGLE_CONNECTED_ACCOUNT,
          messageChannels: [],
          calendarChannels: [],
        }}
      />
    </I18nProvider>,
  );

  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
