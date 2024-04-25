import { createState } from 'twenty-ui';

export const isRequestingCaptchaTokenState = createState<boolean>({
  key: 'isRequestingCaptchaTokenState',
  defaultValue: false,
});
