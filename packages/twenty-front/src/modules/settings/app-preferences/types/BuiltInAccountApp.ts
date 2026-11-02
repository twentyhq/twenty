import { type BuiltInAccountAppPermission } from '@/settings/app-preferences/types/BuiltInAccountAppPermission';
import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { type ConnectedAccountProvider } from 'twenty-shared/types';

export type BuiltInAccountApp = BuiltInApp & {
  id: 'google' | 'outlook' | 'imap';
  coverImage: string;
  provider: ConnectedAccountProvider;
  hasEmails: boolean;
  hasCalendar: boolean;
  permissions: BuiltInAccountAppPermission[];
};
