import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { OnboardingStatus } from '~/generated/graphql';
import { useDefaultHomePagePath } from '~/hooks/useDefaultHomePagePath';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { isDefined } from '~/utils/isDefined';

export const usePageChangeEffectNavigateLocation = () => {
  const isMatchingLocation = useIsMatchingLocation();
  const onboardingStatus = useOnboardingStatus();
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

  if (
    onboardingStatus === OnboardingStatus.UserCreation &&
    !isMatchingOngoingUserCreationRoute
  ) {
    return AppPath.SignInUp;
  }

  if (
    onboardingStatus === OnboardingStatus.SubscriptionIncomplete &&
    !isMatchingLocation(AppPath.PlanRequired)
  ) {
    return AppPath.PlanRequired;
  }

  if (
    isDefined(onboardingStatus) &&
    [
      OnboardingStatus.SubscriptionUnpaid,
      OnboardingStatus.SubscriptionCanceled,
    ].includes(onboardingStatus) &&
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
    isMatchingOnboardingRoute
  ) {
    return defaultHomePagePath;
  }

  if (
    onboardingStatus === OnboardingStatus.CompletedWithoutSubscription &&
    isMatchingOnboardingRoute &&
    !isMatchingLocation(AppPath.PlanRequired)
  ) {
    return defaultHomePagePath;
  }

  if (isMatchingLocation(AppPath.Index)) {
    return defaultHomePagePath;
  }

  return;
};
