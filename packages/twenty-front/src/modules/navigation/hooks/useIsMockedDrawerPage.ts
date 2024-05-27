import { AppPath } from '@/types/AppPath';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const useIsMockedDrawerPage = () => {
  const isMatchingLocation = useIsMatchingLocation();
  return (
    isMatchingLocation(AppPath.Verify) ||
    isMatchingLocation(AppPath.SignInUp) ||
    isMatchingLocation(AppPath.Invite) ||
    isMatchingLocation(AppPath.ResetPassword) ||
    isMatchingLocation(AppPath.CreateWorkspace) ||
    isMatchingLocation(AppPath.PlanRequired) ||
    isMatchingLocation(AppPath.PlanRequiredSuccess)
  );
};
