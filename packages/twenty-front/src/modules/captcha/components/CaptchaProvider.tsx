import React from 'react';
import { CaptchaProviderScriptLoaderEffect } from '@/captcha/components/CaptchaProviderScriptLoaderEffect';

const PATHS_REQUIRING_CAPTCHA = [
  'verify',
  'verify-email',
  'welcome',
  'invite',
  'reset-password',
];

export const CaptchaProvider = ({ children }: React.PropsWithChildren) => {
  const isCurrentPathRequiringCaptcha = PATHS_REQUIRING_CAPTCHA.some(
    (pathRequiringCaptcha: string) => {
      const currentPathFirstSegment = window.location.pathname.split('/')[1];
      return currentPathFirstSegment === pathRequiringCaptcha;
    },
  );

  if (!isCurrentPathRequiringCaptcha) {
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
