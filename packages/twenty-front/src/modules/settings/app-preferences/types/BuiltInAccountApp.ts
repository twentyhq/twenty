import { type BuiltInAccountAppPermission } from '@/settings/app-preferences/types/BuiltInAccountAppPermission';
import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { type ConnectedAccountProvider } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/icon';

export type BuiltInAccountApp = BuiltInApp & {
  id: 'google' | 'outlook' | 'imap';
  coverImage: string;
  Icon: IconComponent;
  provider: ConnectedAccountProvider;
  hasEmails: boolean;
  hasCalendar: boolean;
  permissions: BuiltInAccountAppPermission[];
};
