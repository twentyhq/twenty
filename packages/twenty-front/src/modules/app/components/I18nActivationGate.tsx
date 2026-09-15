import { isOnOnboardingTransitionPath } from '@/auth/utils/isOnOnboardingTransitionPath';
import { OnboardingPageLoader } from '@/onboarding/components/OnboardingPageLoader';
import { i18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useEffect, useState } from 'react';

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
    return isOnOnboardingTransitionPath(window.location.pathname) ? (
      <OnboardingPageLoader />
    ) : null;
  }

  return <>{children}</>;
};
