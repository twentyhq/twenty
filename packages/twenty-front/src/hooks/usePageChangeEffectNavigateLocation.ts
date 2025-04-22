import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { OnboardingStatus } from '~/generated/graphql';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

export const usePageChangeEffectNavigateLocation = () => {
  const { isMatchingLocation } = useIsMatchingLocation();
  const isLoggedIn = useIsLogged();
  const onboardingStatus = useOnboardingStatus();
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  const { defaultHomePagePath } = useDefaultHomePagePath();

  const isMatchingOpenRoute =
    isMatchingLocation(AppPath.Invite) ||
    isMatchingLocation(AppPath.ResetPassword);

  const isMatchingOngoingUserCreationRoute =
    isMatchingOpenRoute ||
    isMatchingLocation(AppPath.SignInUp) ||
    isMatchingLocation(AppPath.VerifyEmail) ||
    isMatchingLocation(AppPath.Verify);

  const isMatchingOnboardingRoute =
    isMatchingOngoingUserCreationRoute ||
    isMatchingLocation(AppPath.CreateWorkspace) ||
    isMatchingLocation(AppPath.CreateProfile) ||
    isMatchingLocation(AppPath.SyncEmails) ||
    isMatchingLocation(AppPath.InviteTeam) ||
    isMatchingLocation(AppPath.PlanRequired) ||
    isMatchingLocation(AppPath.PlanRequiredSuccess);

  const objectNamePlural = useParams().objectNamePlural ?? '';
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.namePlural === objectNamePlural,
  );

  if (!isLoggedIn && !isMatchingOngoingUserCreationRoute) {
    return AppPath.SignInUp;
  }

  if (
    onboardingStatus === OnboardingStatus.PLAN_REQUIRED &&
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
    onboardingStatus === OnboardingStatus.WORKSPACE_ACTIVATION &&
    !isMatchingLocation(AppPath.CreateWorkspace) &&
    !isMatchingLocation(AppPath.PlanRequiredSuccess)
  ) {
    return AppPath.CreateWorkspace;
  }

  if (
    onboardingStatus === OnboardingStatus.PROFILE_CREATION &&
    !isMatchingLocation(AppPath.CreateProfile)
  ) {
    return AppPath.CreateProfile;
  }

  if (
    onboardingStatus === OnboardingStatus.SYNC_EMAIL &&
    !isMatchingLocation(AppPath.SyncEmails)
  ) {
    return AppPath.SyncEmails;
  }

  if (
    onboardingStatus === OnboardingStatus.INVITE_TEAM &&
    !isMatchingLocation(AppPath.InviteTeam)
  ) {
    return AppPath.InviteTeam;
  }

  if (
    onboardingStatus === OnboardingStatus.COMPLETED &&
    isMatchingOnboardingRoute &&
    isLoggedIn
  ) {
    return defaultHomePagePath;
  }

  if (isMatchingLocation(AppPath.Index) && isLoggedIn) {
    return defaultHomePagePath;
  }

  if (
    isMatchingLocation(AppPath.RecordIndexPage) &&
    !isDefined(objectMetadataItem)
  ) {
    return AppPath.NotFound;
  }

  return;
};
