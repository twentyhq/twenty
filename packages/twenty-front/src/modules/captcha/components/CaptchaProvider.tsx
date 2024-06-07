import React from 'react';

import { CaptchaProviderScriptLoaderEffect } from '@/captcha/components/CaptchaProviderScriptLoaderEffect';

export const CaptchaProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <div id="captcha-widget" data-size="invisible"></div>
      <CaptchaProviderScriptLoaderEffect />
      {children}
    </>
  );
};
