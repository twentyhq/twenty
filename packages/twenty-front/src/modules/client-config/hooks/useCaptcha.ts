import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { captchaState } from '@/client-config/states/captchaState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { isDefined } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCaptcha = () => {
  const captcha = useRecoilValueV2(captchaState);
  const captchaToken = useRecoilValueV2(captchaTokenState);
  const clientConfigApiStatus = useRecoilValueV2(clientConfigApiStatusState);
  const isCaptchaScriptLoaded = useRecoilValueV2(isCaptchaScriptLoadedState);

  const isClientConfigLoaded = clientConfigApiStatus.isLoadedOnce;
  const isSiteKeyDefined = isDefined(captcha?.siteKey);
  const isTokenAvailable = isDefined(captchaToken);

  // Captcha is ready when:
  // - Client config is loaded
  // - And either captcha is not configured with a site key (no captcha required)
  // - Or, when configured, a captcha token is available
  const isCaptchaReady =
    isClientConfigLoaded && (!isSiteKeyDefined || isTokenAvailable);

  return {
    isCaptchaScriptLoaded,
    isCaptchaConfigured: !isUndefinedOrNull(captcha),
    isCaptchaReady,
  };
};
