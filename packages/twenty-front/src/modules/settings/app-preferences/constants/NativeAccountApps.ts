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
    permissions: ['READ_EMAILS', 'SEND_EMAILS'],
  },
  {
    id: 'google-calendar',
    name: msg`Google Calendar`,
    Icon: IconGoogleCalendar,
    provider: ConnectedAccountProvider.GOOGLE,
    hasEmails: false,
    hasCalendar: true,
    permissions: ['MANAGE_EVENTS'],
  },
  {
    id: 'outlook',
    name: msg`Outlook`,
    Icon: IconMicrosoftOutlook,
    provider: ConnectedAccountProvider.MICROSOFT,
    hasEmails: true,
    hasCalendar: true,
    permissions: ['READ_EMAILS', 'SEND_EMAILS', 'MANAGE_EVENTS'],
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
