import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendarEvent,
  IconComponent,
  IconGoogle,
  IconMail,
  IconMicrosoft,
  IconSend,
} from 'twenty-ui/display';

const ProviderIcons: { [k: string]: IconComponent } = {
  google: IconGoogle,
  microsoft: IconMicrosoft,
  imap: IconMail,
  smtp: IconSend,
  caldav: IconCalendarEvent,
};

export const getAccountProviderIcon = (account: ConnectedAccount) => {
  if (isDefined(account.connectionParameters?.IMAP)) {
    return ProviderIcons.imap;
  }
  if (isDefined(account.connectionParameters?.SMTP)) {
    return ProviderIcons.smtp;
  }
  if (isDefined(account.connectionParameters?.CALDAV)) {
    return ProviderIcons.caldav;
  }
  return ProviderIcons[account.provider];
};
