import { type BuiltInAccountAppPermission } from '@/settings/app-preferences/types/BuiltInAccountAppPermission';
import { type MessageDescriptor } from '@lingui/core';
import { type ConnectedAccountProvider } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/icon';

export type BuiltInAccountApp = {
  id: 'google' | 'outlook' | 'imap';
  name: MessageDescriptor;
  description: MessageDescriptor;
  logo: string;
  coverImage: string;
  Icon: IconComponent;
  provider: ConnectedAccountProvider;
  hasEmails: boolean;
  hasCalendar: boolean;
  permissions: BuiltInAccountAppPermission[];
};
