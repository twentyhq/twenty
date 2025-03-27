import { createState } from 'twenty-ui';

export const isCaptchaScriptLoadedState = createState<boolean>({
  key: 'isCaptchaScriptLoadedState',
  defaultValue: false,
});
