import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { findOrThrow } from 'twenty-shared/utils';

import { SettingsNativeAccountAppPermissionsCell } from '@/settings/app-preferences/components/SettingsNativeAccountAppPermissionsCell';
import { NATIVE_ACCOUNT_APPS } from '@/settings/app-preferences/constants/NativeAccountApps';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderPermissionsCell = ({
  nativeAccountAppId,
  scopes,
}: {
  nativeAccountAppId: NativeAccountApp['id'];
  scopes: string[] | null | undefined;
}) =>
  render(
    <SettingsNativeAccountAppPermissionsCell
      nativeAccountApp={findOrThrow(
        NATIVE_ACCOUNT_APPS,
        (nativeAccountApp) => nativeAccountApp.id === nativeAccountAppId,
      )}
      account={scopes === undefined ? undefined : { scopes }}
    />,
    { wrapper: Wrapper },
  );

describe('SettingsNativeAccountAppPermissionsCell', () => {
  it('lists every Gmail permission the account was granted', () => {
    renderPermissionsCell({
      nativeAccountAppId: 'gmail',
      scopes: [
        'email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
      ],
    });

    expect(screen.getByText('Read emails, Send emails')).toBeInTheDocument();
  });

  it.each([
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
  ])('shows Send emails when only %s is granted', (scope) => {
    renderPermissionsCell({
      nativeAccountAppId: 'gmail',
      scopes: [scope],
    });

    expect(screen.getByText('Send emails')).toBeInTheDocument();
  });

  it('lists Outlook permissions in their declared order', () => {
    renderPermissionsCell({
      nativeAccountAppId: 'outlook',
      scopes: ['Calendars.ReadWrite', 'Mail.Send', 'Mail.ReadWrite'],
    });

    expect(
      screen.getByText('Read emails, Send emails, Manage events'),
    ).toBeInTheDocument();
  });

  it('only lists the permissions of the app itself', () => {
    renderPermissionsCell({
      nativeAccountAppId: 'google-calendar',
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    expect(screen.getByText('Manage events')).toBeInTheDocument();
    expect(screen.queryByText(/Read emails/)).not.toBeInTheDocument();
  });

  it('ignores scopes granted for another provider', () => {
    const { container } = renderPermissionsCell({
      nativeAccountAppId: 'outlook',
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    expect(container).toHaveTextContent('');
  });

  it.each([
    ['without an account', undefined],
    ['when the account has no scopes', null],
  ])('lists nothing %s', (_, scopes) => {
    const { container } = renderPermissionsCell({
      nativeAccountAppId: 'gmail',
      scopes,
    });

    expect(container).toHaveTextContent('');
  });

  it('lists nothing for IMAP, which has no OAuth permissions', () => {
    const { container } = renderPermissionsCell({
      nativeAccountAppId: 'imap',
      scopes: ['Mail.ReadWrite'],
    });

    expect(container).toHaveTextContent('');
  });
});
