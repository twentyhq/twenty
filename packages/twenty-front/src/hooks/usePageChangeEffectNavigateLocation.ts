import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
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
    onboardingStatus === OnboardingStatus.OngoingUserCreation &&
    !isMatchingOngoingUserCreationRoute
  ) {
    return AppPath.SignInUp;
  }

  if (
    onboardingStatus === OnboardingStatus.Incomplete &&
    !isMatchingLocation(AppPath.PlanRequired)
  ) {
    return AppPath.PlanRequired;
  }

  if (
    isDefined(onboardingStatus) &&
    [OnboardingStatus.Unpaid, OnboardingStatus.Canceled].includes(
      onboardingStatus,
    ) &&
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
    onboardingStatus === OnboardingStatus.OngoingWorkspaceActivation &&
    !isMatchingLocation(AppPath.CreateWorkspace) &&
    !isMatchingLocation(AppPath.PlanRequiredSuccess)
  ) {
    return AppPath.CreateWorkspace;
  }

  if (
    onboardingStatus === OnboardingStatus.OngoingProfileCreation &&
    !isMatchingLocation(AppPath.CreateProfile)
  ) {
    return AppPath.CreateProfile;
  }

  if (
    onboardingStatus === OnboardingStatus.OngoingSyncEmail &&
    !isMatchingLocation(AppPath.SyncEmails)
  ) {
    return AppPath.SyncEmails;
  }

  if (
    onboardingStatus === OnboardingStatus.OngoingInviteTeam &&
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
