import { createState } from "twenty-shared";

import { Captcha } from '~/generated/graphql';

export const captchaState = createState<Captcha | null>({
  key: 'captchaState',
  defaultValue: null,
});
