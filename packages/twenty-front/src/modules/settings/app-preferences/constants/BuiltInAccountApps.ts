import GoogleLogo from '@/settings/app-preferences/assets/built-in-account-apps/google.svg';
import ImapLogo from '@/settings/app-preferences/assets/built-in-account-apps/imap.svg';
import OutlookLogo from '@/settings/app-preferences/assets/built-in-account-apps/outlook.svg';
import CoverPlaceholder from '@/settings/app-preferences/assets/built-in-account-apps/cover-placeholder.webp';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { msg } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { IconAt, IconGoogle, IconMicrosoftOutlook } from 'twenty-ui/icon';

export const BUILT_IN_ACCOUNT_APPS: BuiltInAccountApp[] = [
  {
    id: 'google',
    name: msg`Gmail and Calendar`,
    description: msg`Sync emails and calendar events from your Google accounts.`,
    logo: GoogleLogo,
    coverImage: CoverPlaceholder,
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
    description: msg`Sync emails and calendar events from your Microsoft accounts.`,
    logo: OutlookLogo,
    coverImage: CoverPlaceholder,
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
    description: msg`Sync emails and calendar events from any IMAP, SMTP and CalDAV server.`,
    logo: ImapLogo,
    coverImage: CoverPlaceholder,
    Icon: IconAt,
    provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    hasEmails: true,
    hasCalendar: true,
    permissions: [],
  },
];
