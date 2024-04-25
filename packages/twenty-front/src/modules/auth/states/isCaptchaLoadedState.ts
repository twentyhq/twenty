import { createState } from 'twenty-ui';

export const isCaptchaLoadedState = createState<boolean>({
  key: 'isCaptchaLoadedState',
  defaultValue: false,
});
