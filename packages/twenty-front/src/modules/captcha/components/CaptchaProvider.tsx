import React from 'react';

import { CaptchaProviderScriptLoaderEffect } from '@/captcha/components/CaptchaProviderScriptLoaderEffect';
import { isCurrentPathRequiringCaptcha } from '@/captcha/utils/isCaptchaRequiredForPath';

export const CaptchaProvider = ({ children }: React.PropsWithChildren) => {
  if (!isCurrentPathRequiringCaptcha()) {
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
