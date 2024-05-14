import { useRecoilCallback } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isDefined } from '~/utils/isDefined';

export const useReadCaptchaToken = () => {
  const readCaptchaToken = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const existingCaptchaToken = snapshot
          .getLoadable(captchaTokenState)
          .getValue();

        if (isDefined(existingCaptchaToken)) {
          return existingCaptchaToken;
        }
      },
    [],
  );

  return { readCaptchaToken };
};
