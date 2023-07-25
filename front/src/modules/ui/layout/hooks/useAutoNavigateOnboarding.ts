import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIsMatchingLocation } from '../../../../hooks/useIsMatchingLocation';
import { useOnboardingStatus } from '../../../auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '../../../auth/utils/getOnboardingStatus';
import { AppPath } from '../../../types/AppPath';

export function useAutoNavigateOnboarding() {
  const navigate = useNavigate();
  const isMatchingLocation = useIsMatchingLocation();

  const onboardingStatus = useOnboardingStatus();

  useEffect(() => {
    const isMachinOngoingUserCreationRoute =
      isMatchingLocation(AppPath.SignUp) ||
      isMatchingLocation(AppPath.SignIn) ||
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.Verify);

    const isMatchingOnboardingRoute =
      isMatchingLocation(AppPath.SignUp) ||
      isMatchingLocation(AppPath.SignIn) ||
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.Verify) ||
      isMatchingLocation(AppPath.CreateWorkspace) ||
      isMatchingLocation(AppPath.CreateProfile);

    if (
      onboardingStatus === OnboardingStatus.OngoingUserCreation &&
      !isMachinOngoingUserCreationRoute
    ) {
      navigate(AppPath.SignIn);
    } else if (
      onboardingStatus === OnboardingStatus.OngoingWorkspaceCreation &&
      !isMatchingLocation(AppPath.CreateWorkspace)
    ) {
      navigate(AppPath.CreateWorkspace);
    } else if (
      onboardingStatus === OnboardingStatus.OngoingProfileCreation &&
      !isMatchingLocation(AppPath.CreateProfile)
    ) {
      navigate(AppPath.CreateProfile);
    } else if (
      onboardingStatus === OnboardingStatus.Completed &&
      isMatchingOnboardingRoute
    ) {
      navigate('/');
    }
  }, [onboardingStatus, navigate, isMatchingLocation]);
}
