import { CaptchaScriptLoaderEffect } from '@/captcha/components/CaptchaScriptLoaderEffect';
import React from 'react';

export const Captcha = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <div id="captcha-widget" data-size="invisible"></div>
      <CaptchaScriptLoaderEffect />
      {children}
    </>
  );
};
