import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { useForm } from 'react-hook-form';
import { type AccountType } from 'twenty-shared/constants';

import { SettingsAccountsConnectionForm } from '@/settings/accounts/components/SettingsAccountsConnectionForm';
import { type ConnectionFormData } from '@/settings/accounts/hooks/useImapSmtpCaldavConnectionForm';

type ConnectionFormWrapperProps = {
  existingProtocols?: AccountType[];
};

const ConnectionFormWrapper = ({
  existingProtocols,
}: ConnectionFormWrapperProps) => {
  const { control } = useForm<ConnectionFormData>();

  return (
    <SettingsAccountsConnectionForm
      control={control}
      isEditing={existingProtocols !== undefined}
      existingProtocols={existingProtocols}
    />
  );
};

const renderConnectionForm = (existingProtocols?: AccountType[]) =>
  render(
    <Provider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <ConnectionFormWrapper existingProtocols={existingProtocols} />
      </I18nProvider>
    </Provider>,
  );

it('opts every password out of saved-login autofill when creating an account', () => {
  renderConnectionForm();

  for (const protocol of ['IMAP', 'SMTP', 'CalDAV']) {
    expect(screen.getByLabelText(`${protocol} Password`)).toHaveAttribute(
      'autocomplete',
      'new-password',
    );
  }
});

it('keeps saved-login autofill out of an unlocked password when editing an account', async () => {
  renderConnectionForm(['IMAP']);

  await userEvent.click(
    screen.getByRole('button', { name: 'Change password' }),
  );

  const imapPassword = screen.getByLabelText('IMAP Password');

  expect(imapPassword).toBeEnabled();
  expect(imapPassword).toHaveAttribute('type', 'password');
  expect(imapPassword).toHaveAttribute('autocomplete', 'new-password');
});
