import React, { useMemo } from 'react';

import { CaptchaProviderScriptLoaderEffect } from '@/captcha/components/CaptchaProviderScriptLoaderEffect';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { useLocation } from 'react-router-dom';

export const CaptchaProvider = React.memo(
  ({ children }: React.PropsWithChildren) => {
    const location = useLocation();

    const isCaptchaRequired = useMemo(
      () => isCaptchaRequiredForPath(location.pathname),
      [location.pathname],
    );

    return (
      <>
        {isCaptchaRequired && (
          <>
            <div id="captcha-widget" data-size="invisible"></div>
            <CaptchaProviderScriptLoaderEffect />
          </>
        )}
        {children}
      </>
    );
  },
);

CaptchaProvider.displayName = 'CaptchaProvider';
