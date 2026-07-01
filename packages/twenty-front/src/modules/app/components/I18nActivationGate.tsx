import { OnboardingPageLoader } from '@/onboarding/components/OnboardingPageLoader';
import { i18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useEffect, useState } from 'react';
import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const ONBOARDING_V2_PATHS = [
  AppPath.SignInUpV2,
  AppPath.VerifyV2,
  AppPath.WorkspaceActivationV2,
  AppPath.CreateProfileV2,
  AppPath.SyncEmailsV2,
  AppPath.InviteTeamV2,
  AppPath.PlanRequiredV2,
];

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
    const isOnboardingLocation = ONBOARDING_V2_PATHS.some(
      (onboardingPath) =>
        isDefined(matchPath(onboardingPath, window.location.pathname)),
    );

    return isOnboardingLocation ? <OnboardingPageLoader /> : null;
  }

  return <>{children}</>;
};
