import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { OnboardingStatus, SubscriptionStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const usePageChangeEffectNavigateLocation = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const isLoggedIn = useIsLogged();
  const onboardingStatus = useOnboardingStatus();
  const subscriptionStatus = useSubscriptionStatus();
  const { defaultHomePagePath } = useDefaultHomePagePath();

  const isMatchingOpenRoute =
    isMatchingLocation(AppPath.Invite) ||
    isMatchingLocation(AppPath.ResetPassword);

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
    !isMatchingLocation(AppPath.PlanRequired)
  ) {
    return AppPath.PlanRequired;
  }

  if (
    subscriptionStatus === SubscriptionStatus.Unpaid &&
    !isMatchingLocation(AppPath.SettingsCatchAll)
  ) {
    return `${AppPath.SettingsCatchAll.replace('/*', '')}/${
      SettingsPath.Billing
    }`;
  }

  if (
    subscriptionStatus === SubscriptionStatus.Canceled &&
    !(
      isMatchingLocation(AppPath.SettingsCatchAll) ||
      isMatchingLocation(AppPath.PlanRequired)
    )
  ) {
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
    subscriptionStatus === SubscriptionStatus.Canceled &&
    isMatchingLocation(AppPath.PlanRequired)
  ) {
    return;
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
