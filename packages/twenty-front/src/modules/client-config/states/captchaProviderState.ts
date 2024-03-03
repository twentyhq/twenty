import { atom } from 'recoil';

import { Captcha } from '~/generated/graphql';

export const captchaProviderState = atom<Captcha | null>({
  key: 'captchaProviderState',
  default: null,
});
