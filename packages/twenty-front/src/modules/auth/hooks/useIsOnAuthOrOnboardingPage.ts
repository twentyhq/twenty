import { AUTH_AND_ONBOARDING_PATHS } from '@/auth/constants/AuthAndOnboardingPaths';
import { useLocation } from 'react-router-dom';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useIsOnAuthOrOnboardingPage = () => {
  const location = useLocation();

  return AUTH_AND_ONBOARDING_PATHS.some((appPath) =>
    isMatchingLocation(location, appPath),
  );
};
