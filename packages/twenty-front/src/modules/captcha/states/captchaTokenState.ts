import { createState } from 'twenty-ui/utilities';
export const captchaTokenState = createState<string | undefined>({
  key: 'captchaTokenState',
  defaultValue: undefined,
});
