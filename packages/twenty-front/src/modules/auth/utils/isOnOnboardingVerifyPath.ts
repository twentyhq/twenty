import { matchPath } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { ONBOARDING_VERIFY_PATHS } from '@/auth/constants/OnboardingVerifyPaths';

export const isOnOnboardingVerifyPath = (pathname: string) =>
  ONBOARDING_VERIFY_PATHS.some((verifyPath) =>
    isDefined(matchPath(verifyPath, pathname)),
  );
