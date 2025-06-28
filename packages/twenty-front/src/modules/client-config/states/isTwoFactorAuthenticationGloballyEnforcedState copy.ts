import { createState } from 'twenty-ui/utilities';
export const isTwoFactorAuthenticationGloballyEnforcedState =
  createState<boolean>({
    key: 'isTwoFactorAuthenticationGloballyEnforced',
    defaultValue: false,
  });
