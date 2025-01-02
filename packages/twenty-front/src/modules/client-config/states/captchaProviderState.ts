import { createState } from '@ui/utilities/state/utils/createState';

import { Captcha } from '~/generated/graphql';

export const captchaProviderState = createState<Captcha | null>({
  key: 'captchaProviderState',
  defaultValue: null,
});
