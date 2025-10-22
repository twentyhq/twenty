import { isDefined } from 'twenty-shared/utils';
import { useRecoilValue } from 'recoil';
import { captchaState } from '@/client-config/states/captchaState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { captchaTokenState } from '@/captcha/states/captchaTokenState';

export const useCaptcha = () => {
  const captcha = useRecoilValue(captchaState);
  const captchaToken = useRecoilValue(captchaTokenState);
  const clientConfigApiStatus = useRecoilValue(clientConfigApiStatusState);
  const isCaptchaScriptLoaded = useRecoilValue(isCaptchaScriptLoadedState);

  const isCaptchaReady = () => {
    // If the client config is not loaded yet, we can't know if the captcha is ready
    if (!clientConfigApiStatus.isLoadedOnce) return false;
    // If the captcha is not configured, we can assume it is ready
    if (clientConfigApiStatus.isLoadedOnce && !captcha?.siteKey) return true;
    // If the captcha is configured, we need to check if the token is available
    return !!(
      clientConfigApiStatus.isLoadedOnce &&
      isDefined(captcha?.siteKey) &&
      isDefined(captchaToken)
    );
  };

  return {
    isCaptchaScriptLoaded,
    isCaptchaConfigured: !isUndefinedOrNull(captcha),
    isCaptchaReady,
  };
};
