import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { msg } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import {
  IconAt,
  IconGmail,
  IconGoogleCalendar,
  IconMicrosoftOutlook,
} from 'twenty-ui/icon';

export const NATIVE_ACCOUNT_APPS: NativeAccountApp[] = [
  {
    id: 'gmail',
    name: msg`Gmail`,
    Icon: IconGmail,
    provider: ConnectedAccountProvider.GOOGLE,
    hasEmails: true,
    hasCalendar: false,
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
    ],
  },
  {
    id: 'google-calendar',
    name: msg`Google Calendar`,
    Icon: IconGoogleCalendar,
    provider: ConnectedAccountProvider.GOOGLE,
    hasEmails: false,
    hasCalendar: true,
    permissions: [
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
