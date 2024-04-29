import { createState } from 'twenty-ui';

import { Captcha } from '~/generated/graphql';

export const captchaProviderState = createState<Captcha | null>({
  key: 'captchaProviderState',
  defaultValue: null,
});
