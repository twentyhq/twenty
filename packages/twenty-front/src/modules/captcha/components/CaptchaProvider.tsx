import React from 'react';

import { CaptchaProviderScriptLoaderEffect } from '@/captcha/components/CaptchaProviderScriptLoaderEffect';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { useLocation } from 'react-router-dom';

export const CaptchaProvider = ({ children }: React.PropsWithChildren) => {
  const location = useLocation();

  if (!isCaptchaRequiredForPath(location.pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <div id="captcha-widget" data-size="invisible"></div>
      <CaptchaProviderScriptLoaderEffect />
      {children}
    </>
  );
};
