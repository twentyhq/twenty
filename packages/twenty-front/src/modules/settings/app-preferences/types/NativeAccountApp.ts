import { type NativeAccountAppPermission } from '@/settings/app-preferences/types/NativeAccountAppPermission';
import { type MessageDescriptor } from '@lingui/core';
import { type ConnectedAccountProvider } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/icon';

export type NativeAccountApp = {
  id: 'gmail' | 'google-calendar' | 'outlook' | 'imap';
  name: MessageDescriptor;
  Icon: IconComponent;
  provider: ConnectedAccountProvider;
  hasEmails: boolean;
  hasCalendar: boolean;
  permissions: NativeAccountAppPermission[];
};
