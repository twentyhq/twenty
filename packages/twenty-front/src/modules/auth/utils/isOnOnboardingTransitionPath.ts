import { matchPath } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { ONBOARDING_TRANSITION_PATHS } from '@/auth/constants/OnboardingTransitionPaths';

export const isOnOnboardingTransitionPath = (pathname: string) =>
  ONBOARDING_TRANSITION_PATHS.some((onboardingPath) =>
    isDefined(matchPath(onboardingPath, pathname)),
  );
