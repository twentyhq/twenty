import { createState } from 'twenty-ui';

export const captchaTokenState = createState<string | undefined>({
  key: 'captchaTokenState',
  defaultValue: undefined,
});
