import { useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { currentUserState } from '../states/currentUserState';
import {
  getOnboardingStatus,
  OnboardingStatus,
} from '../utils/getOnboardingStatus';

export function useOnboardingStatus(): OnboardingStatus {
  const [currentUser] = useRecoilState(currentUserState);
  const onboardingStatus = useMemo(
    () => getOnboardingStatus(currentUser),
    [currentUser],
  );

  return onboardingStatus;
}
