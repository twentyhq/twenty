import React from 'react';
import { matchPath } from 'react-router-dom';

import { CaptchaProviderScriptLoaderEffect } from '@/captcha/components/CaptchaProviderScriptLoaderEffect';
import { AppPath } from '@/types/AppPath';

const PATHS_REQUIRING_CAPTCHA = [
  AppPath.SignInUp,
  AppPath.Verify,
  AppPath.VerifyEmail,
  AppPath.ResetPassword,
  AppPath.Invite,
];

const isCurrentPathRequiringCaptcha = (): boolean => {
  const { pathname } = window.location;

  return PATHS_REQUIRING_CAPTCHA.some((path) =>
    matchPath(
      {
        path,
        end: false, // Match nested routes too
      },
      pathname,
    ),
  );
};

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
