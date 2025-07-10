import { createState } from 'twenty-ui/utilities';
export const isTwoFactorAuthenticationEnabledState = createState<boolean>({
  key: 'isTwoFactorAuthenticationEnabled',
  defaultValue: false,
});
