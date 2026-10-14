import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { findOrThrow } from 'twenty-shared/utils';

import { SettingsNativeAccountAppPermissionsCell } from '@/settings/app-preferences/components/SettingsNativeAccountAppPermissionsCell';
import { NATIVE_ACCOUNT_APPS } from '@/settings/app-preferences/constants/NativeAccountApps';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { ComponentDecorator } from 'twenty-ui/testing';

const getNativeAccountApp = (nativeAccountAppId: NativeAccountApp['id']) =>
  findOrThrow(
    NATIVE_ACCOUNT_APPS,
    (nativeAccountApp) => nativeAccountApp.id === nativeAccountAppId,
  );

const PERMISSION_LABELS_PATTERN = /Read emails|Send emails|Manage events/;

const meta: Meta<typeof SettingsNativeAccountAppPermissionsCell> = {
  title:
    'Modules/Settings/AppPreferences/SettingsNativeAccountAppPermissionsCell',
  component: SettingsNativeAccountAppPermissionsCell,
  decorators: [ComponentDecorator],
  args: {
    nativeAccountApp: getNativeAccountApp('gmail'),
    account: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof SettingsNativeAccountAppPermissionsCell>;

export const GmailWithEveryPermission: Story = {
  args: {
    account: {
      scopes: [
        'email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Read emails, Send emails'),
    ).toBeInTheDocument();
  },
};

export const GmailWithSendOnly: Story = {
  args: {
    account: { scopes: ['https://www.googleapis.com/auth/gmail.send'] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Send emails')).toBeInTheDocument();
  },
};

export const GmailWithComposeOnly: Story = {
  args: {
    account: { scopes: ['https://www.googleapis.com/auth/gmail.compose'] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Send emails')).toBeInTheDocument();
  },
};

export const OutlookInDeclaredOrder: Story = {
  args: {
    nativeAccountApp: getNativeAccountApp('outlook'),
    account: {
      scopes: ['Calendars.ReadWrite', 'Mail.Send', 'Mail.ReadWrite'],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Read emails, Send emails, Manage events'),
    ).toBeInTheDocument();
  },
};

export const GoogleCalendarListsOnlyItsOwnPermissions: Story = {
  args: {
    nativeAccountApp: getNativeAccountApp('google-calendar'),
    account: {
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Manage events')).toBeInTheDocument();
    expect(canvas.queryByText(/Read emails/)).not.toBeInTheDocument();
  },
};

export const OutlookIgnoresGoogleScopes: Story = {
  args: {
    nativeAccountApp: getNativeAccountApp('outlook'),
    account: {
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.queryByText(PERMISSION_LABELS_PATTERN),
    ).not.toBeInTheDocument();
  },
};

export const WithoutAccount: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.queryByText(PERMISSION_LABELS_PATTERN),
    ).not.toBeInTheDocument();
  },
};

export const AccountWithoutScopes: Story = {
  args: {
    account: { scopes: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.queryByText(PERMISSION_LABELS_PATTERN),
    ).not.toBeInTheDocument();
  },
};

export const ImapHasNoOAuthPermissions: Story = {
  args: {
    nativeAccountApp: getNativeAccountApp('imap'),
    account: { scopes: ['Mail.ReadWrite'] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.queryByText(PERMISSION_LABELS_PATTERN),
    ).not.toBeInTheDocument();
  },
};
