import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type IconComponent, IconKey, IconLockOpen } from 'twenty-ui/icon';
export type AuthenticationMethods = 'API_KEY' | null;

export const WEBHOOK_TRIGGER_AUTHENTICATION_OPTIONS: Array<{
  label: MessageDescriptor;
  value: AuthenticationMethods;
  Icon: IconComponent;
}> = [
  {
    label: msg`None`,
    value: null,
    Icon: IconLockOpen,
  },
  {
    label: msg`API key`,
    value: 'API_KEY',
    Icon: IconKey,
  },
];
