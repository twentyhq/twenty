import { type ConnectedAccountProvider } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/icon';

export type BuiltInAppId =
  | 'gmail'
  | 'google-calendar'
  | 'outlook'
  | 'imap-smtp-caldav';

export type BuiltInApp = {
  id: BuiltInAppId;
  name: string;
  Icon: IconComponent;
  provider: ConnectedAccountProvider;
  hasMessaging: boolean;
  hasCalendar: boolean;
};
