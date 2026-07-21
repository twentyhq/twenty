import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const RequestFreshCaptchaTokenEffect = () => {
  const location = useLocation();
  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();
  const isCaptchaScriptLoaded = useAtomStateValue(isCaptchaScriptLoadedState);

  useEffect(() => {
    if (isCaptchaScriptLoaded && isCaptchaRequiredForPath(location.pathname)) {
      requestFreshCaptchaToken();
    }
  }, [isCaptchaScriptLoaded, location.pathname, requestFreshCaptchaToken]);

  return null;
};
