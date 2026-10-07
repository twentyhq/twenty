import { GMAIL_COMPOSE_SCOPE } from '@/accounts/constants/GmailComposeScope';
import { GOOGLE_CALENDAR_EVENTS_SCOPE } from '@/accounts/constants/GoogleCalendarEventsScope';
import { MICROSOFT_CALENDARS_READ_WRITE_SCOPE } from '@/accounts/constants/MicrosoftCalendarsReadWriteScope';
import { MICROSOFT_SEND_SCOPE } from '@/accounts/constants/MicrosoftSendScope';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { t } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getAccountPermissions = (
  account: Pick<
    ConnectedAccount,
    'provider' | 'scopes' | 'connectionParameters'
  >,
): string[] => {
  if (account.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV) {
    return [
      ...(isDefined(account.connectionParameters?.IMAP)
        ? [t`Read emails`]
        : []),
      ...(isDefined(account.connectionParameters?.SMTP)
        ? [t`Write emails`]
        : []),
      ...(isDefined(account.connectionParameters?.CALDAV)
        ? [t`Read calendar`, t`Write calendar`]
        : []),
    ];
  }

  const scopes = new Set(account.scopes ?? []);
  const permissions: string[] = [];

  if (account.provider === ConnectedAccountProvider.GOOGLE) {
    const canModifyEmails =
      scopes.has('https://mail.google.com/') ||
      scopes.has('https://www.googleapis.com/auth/gmail.modify');
    const canWriteEmails = canModifyEmails || scopes.has(GMAIL_COMPOSE_SCOPE);
    const canWriteCalendar =
      scopes.has('https://www.googleapis.com/auth/calendar') ||
      scopes.has(GOOGLE_CALENDAR_EVENTS_SCOPE);

    if (
      canModifyEmails ||
      scopes.has('https://www.googleapis.com/auth/gmail.readonly')
    ) {
      permissions.push(t`Read emails`);
    }
    if (
      canWriteEmails ||
      scopes.has('https://www.googleapis.com/auth/gmail.send')
    ) {
      permissions.push(t`Write emails`);
    }
    if (
      canWriteCalendar ||
      scopes.has('https://www.googleapis.com/auth/calendar.readonly') ||
      scopes.has('https://www.googleapis.com/auth/calendar.events.readonly')
    ) {
      permissions.push(t`Read calendar`);
    }
    if (canWriteCalendar) {
      permissions.push(t`Write calendar`);
    }
  }

  if (account.provider === ConnectedAccountProvider.MICROSOFT) {
    if (scopes.has('Mail.Read') || scopes.has('Mail.ReadWrite')) {
      permissions.push(t`Read emails`);
    }
    if (scopes.has('Mail.ReadWrite') || scopes.has(MICROSOFT_SEND_SCOPE)) {
      permissions.push(t`Write emails`);
    }
    if (
      scopes.has('Calendars.Read') ||
      scopes.has(MICROSOFT_CALENDARS_READ_WRITE_SCOPE)
    ) {
      permissions.push(t`Read calendar`);
    }
    if (scopes.has(MICROSOFT_CALENDARS_READ_WRITE_SCOPE)) {
      permissions.push(t`Write calendar`);
    }
  }

  return permissions;
};
