import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { captchaState } from '@/client-config/states/captchaState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { isDefined } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCaptcha = () => {
  const captcha = useAtomValue(captchaState);
  const captchaToken = useAtomValue(captchaTokenState);
  const clientConfigApiStatus = useAtomValue(clientConfigApiStatusState);
  const isCaptchaScriptLoaded = useAtomValue(isCaptchaScriptLoadedState);

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
