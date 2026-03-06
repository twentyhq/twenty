import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { captchaState } from '@/client-config/states/captchaState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCaptcha = () => {
  const captcha = useAtomStateValue(captchaState);
  const captchaToken = useAtomStateValue(captchaTokenState);
  const clientConfigApiStatus = useAtomStateValue(clientConfigApiStatusState);
  const isCaptchaScriptLoaded = useAtomStateValue(isCaptchaScriptLoadedState);

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
