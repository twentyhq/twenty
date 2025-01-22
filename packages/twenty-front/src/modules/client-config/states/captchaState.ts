import { createState } from 'twenty-ui';

import { Captcha } from '~/generated/graphql';

export const captchaState = createState<Captcha | null>({
  key: 'captchaState',
  defaultValue: null,
});
