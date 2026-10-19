import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { msg } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { IconAt, IconGoogle, IconMicrosoftOutlook } from 'twenty-ui/icon';

export const NATIVE_ACCOUNT_APPS: NativeAccountApp[] = [
  {
    id: 'google',
    name: msg`Gmail and Calendar`,
    Icon: IconGoogle,
    provider: ConnectedAccountProvider.GOOGLE,
    hasEmails: true,
    hasCalendar: true,
    permissions: [
      {
        label: msg`Read emails`,
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      },
      {
        label: msg`Send emails`,
        scopes: [
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.compose',
        ],
      },
      {
        label: msg`Manage events`,
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
      },
    ],
  },
  {
    id: 'outlook',
    name: msg`Outlook`,
    Icon: IconMicrosoftOutlook,
    provider: ConnectedAccountProvider.MICROSOFT,
    hasEmails: true,
    hasCalendar: true,
    permissions: [
      { label: msg`Read emails`, scopes: ['Mail.ReadWrite'] },
      { label: msg`Send emails`, scopes: ['Mail.Send'] },
      { label: msg`Manage events`, scopes: ['Calendars.ReadWrite'] },
    ],
  },
  {
    id: 'imap',
    name: msg`IMAP`,
    Icon: IconAt,
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    hasEmails: true,
    hasCalendar: true,
    permissions: [],
  },
];
