import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { UPGRADE_STEP_CONTENT_WIDTH } from '@/onboarding/constants/UpgradeStepContentWidth';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useOnboardingContentWidth = () => {
  const location = useLocation();

  return isMatchingLocation(location, AppPath.PlanRequired)
    ? UPGRADE_STEP_CONTENT_WIDTH
    : ONBOARDING_CONTENT_BLOCK_WIDTH;
};
