import { ONBOARDING_V2_PATHS } from '@/auth/constants/OnboardingV2Paths';
import { OnboardingPageLoader } from '@/onboarding/components/OnboardingPageLoader';
import { i18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useEffect, useState } from 'react';
import { matchPath } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

type I18nActivationGateProps = {
  children: ReactNode;
};

export const I18nActivationGate = ({ children }: I18nActivationGateProps) => {
  const [isLocaleActivated, setIsLocaleActivated] = useState(() =>
    isNonEmptyString(i18n.locale),
  );

  useEffect(() => {
    const handleLocaleChange = () => {
      if (isNonEmptyString(i18n.locale)) {
        setIsLocaleActivated(true);
      }
    };

    const unsubscribe = i18n.on('change', handleLocaleChange);
    handleLocaleChange();

    return unsubscribe;
  }, []);

  if (!isLocaleActivated) {
    const isOnboardingLocation = ONBOARDING_V2_PATHS.some((onboardingPath) =>
      isDefined(matchPath(onboardingPath, window.location.pathname)),
    );

    return isOnboardingLocation ? <OnboardingPageLoader /> : null;
  }

  return <>{children}</>;
};
