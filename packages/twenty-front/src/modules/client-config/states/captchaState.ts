import { createState } from '@ui/utilities/state/utils/createState';

import { Captcha } from '~/generated/graphql';

export const captchaState = createState<Captcha | null>({
  key: 'captchaState',
  defaultValue: null,
});
