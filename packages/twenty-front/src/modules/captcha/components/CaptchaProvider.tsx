import React from 'react';

import { CaptchaProviderScriptLoaderEffect } from '@/captcha/components/CaptchaProviderScriptLoaderEffect';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';

export const CaptchaProvider = ({ children }: React.PropsWithChildren) => {
  if (!isCaptchaRequiredForPath(window.location.pathname)) {
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
