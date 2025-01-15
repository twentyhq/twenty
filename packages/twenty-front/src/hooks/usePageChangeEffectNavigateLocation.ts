import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useIsWorkspaceActivationStatusSuspended } from '@/workspace/hooks/useIsWorkspaceActivationStatusSuspended';
import { OnboardingStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const usePageChangeEffectNavigateLocation = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const isLoggedIn = useIsLogged();
  const onboardingStatus = useOnboardingStatus();
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusSuspended();
  const { defaultHomePagePath } = useDefaultHomePagePath();

  const isMatchingOpenRoute =
    isMatchingLocation(AppPath.Invite) ||
    isMatchingLocation(AppPath.ResetPassword) ||
    isMatchingLocation(AppPath.VerifyEmail);

  const isMatchingOngoingUserCreationRoute =
    isMatchingOpenRoute ||
    isMatchingLocation(AppPath.SignInUp) ||
    isMatchingLocation(AppPath.Verify);

  const isMatchingOnboardingRoute =
    isMatchingOngoingUserCreationRoute ||
    isMatchingLocation(AppPath.CreateWorkspace) ||
    isMatchingLocation(AppPath.CreateProfile) ||
    isMatchingLocation(AppPath.SyncEmails) ||
    isMatchingLocation(AppPath.InviteTeam) ||
    isMatchingLocation(AppPath.PlanRequired) ||
    isMatchingLocation(AppPath.PlanRequiredSuccess);

  if (isMatchingOpenRoute) {
    return;
  }

  if (!isLoggedIn && !isMatchingOngoingUserCreationRoute) {
    return AppPath.SignInUp;
  }

  if (
    onboardingStatus === OnboardingStatus.PlanRequired &&
    !isMatchingLocation(AppPath.PlanRequired) &&
    !isMatchingLocation(AppPath.PlanRequiredSuccess)
  ) {
    return AppPath.PlanRequired;
  }

  if (isWorkspaceSuspended && !isMatchingLocation(AppPath.SettingsCatchAll)) {
    return `${AppPath.SettingsCatchAll.replace('/*', '')}/${
      SettingsPath.Billing
    }`;
  }

  if (
    onboardingStatus === OnboardingStatus.WorkspaceActivation &&
    !isMatchingLocation(AppPath.CreateWorkspace) &&
    !isMatchingLocation(AppPath.PlanRequiredSuccess)
  ) {
    return AppPath.CreateWorkspace;
  }

  if (
    onboardingStatus === OnboardingStatus.ProfileCreation &&
    !isMatchingLocation(AppPath.CreateProfile)
  ) {
    return AppPath.CreateProfile;
  }

  if (
    onboardingStatus === OnboardingStatus.SyncEmail &&
    !isMatchingLocation(AppPath.SyncEmails)
  ) {
    return AppPath.SyncEmails;
  }

  if (
    onboardingStatus === OnboardingStatus.InviteTeam &&
    !isMatchingLocation(AppPath.InviteTeam)
  ) {
    return AppPath.InviteTeam;
  }

  if (
    onboardingStatus === OnboardingStatus.Completed &&
    isMatchingOnboardingRoute &&
    isLoggedIn
  ) {
    return defaultHomePagePath;
  }

  if (isMatchingLocation(AppPath.Index) && isLoggedIn) {
    return defaultHomePagePath;
  }

  return;
};
