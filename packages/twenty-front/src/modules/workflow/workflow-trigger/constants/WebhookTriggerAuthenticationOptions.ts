import { type IconComponent, IconLockOpen, IconFlag } from 'twenty-ui/display';
export type AuthenticationMethods = 'API_KEY' | null;

export const WEBHOOK_TRIGGER_AUTHENTICATION_OPTIONS: Array<{
  label: string;
  value: AuthenticationMethods;
  Icon: IconComponent;
}> = [
  {
    label: 'None',
    value: null,
    Icon: IconLockOpen,
  },
  {
    label: 'API key',
    value: 'API_KEY',
    Icon: IconFlag,
  },
];
