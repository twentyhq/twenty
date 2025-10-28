import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useLocation, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { OnboardingStatus } from '~/generated/graphql';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const usePageChangeEffectNavigateLocation = () => {
  const isLoggedIn = useIsLogged();
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();
  const onboardingStatus = useOnboardingStatus();
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const location = useLocation();
  const calendarBookingPageId = useRecoilValue(calendarBookingPageIdState);

  const someMatchingLocationOf = (appPaths: AppPath[]): boolean =>
    appPaths.some((appPath) => isMatchingLocation(location, appPath));
  const onGoingUserCreationPaths = [
    AppPath.Invite,
    AppPath.SignInUp,
    AppPath.VerifyEmail,
    AppPath.Verify,
  ];
  const onboardingPaths = [
    AppPath.CreateWorkspace,
    AppPath.CreateProfile,
    AppPath.SyncEmails,
    AppPath.InviteTeam,
    AppPath.PlanRequired,
    AppPath.PlanRequiredSuccess,
    AppPath.BookCallDecision,
    AppPath.BookCall,
  ];

  const objectNamePlural = useParams().objectNamePlural ?? '';
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const objectMetadataItem = objectMetadataItems?.find(
    (objectMetadataItem) => objectMetadataItem.namePlural === objectNamePlural,
  );
  const verifyEmailRedirectPath = useRecoilValue(verifyEmailRedirectPathState);

  if (
    (!isLoggedIn || (isLoggedIn && !isOnAWorkspace)) &&
    !someMatchingLocationOf([
      ...onGoingUserCreationPaths,
      AppPath.ResetPassword,
    ])
  ) {
    return AppPath.SignInUp;
  }

  if (
    onboardingStatus === OnboardingStatus.PLAN_REQUIRED &&
    !someMatchingLocationOf([
      AppPath.PlanRequired,
      AppPath.PlanRequiredSuccess,
      AppPath.BookCall,
      AppPath.BookCallDecision,
    ])
  ) {
    if (
      isMatchingLocation(location, AppPath.VerifyEmail) &&
      isDefined(verifyEmailRedirectPath)
    ) {
      return verifyEmailRedirectPath;
    }
    return AppPath.PlanRequired;
  }

  if (isWorkspaceSuspended) {
    if (!isMatchingLocation(location, AppPath.SettingsCatchAll)) {
      return `${AppPath.SettingsCatchAll.replace('/*', '')}/${
        SettingsPath.Billing
      }`;
    }

    return;
  }

  if (
    onboardingStatus === OnboardingStatus.WORKSPACE_ACTIVATION &&
    !someMatchingLocationOf([
      AppPath.CreateWorkspace,
      AppPath.BookCallDecision,
      AppPath.BookCall,
    ])
  ) {
    return AppPath.CreateWorkspace;
  }

  if (
    onboardingStatus === OnboardingStatus.PROFILE_CREATION &&
    !isMatchingLocation(location, AppPath.CreateProfile)
  ) {
    return AppPath.CreateProfile;
  }

  if (
    onboardingStatus === OnboardingStatus.SYNC_EMAIL &&
    !isMatchingLocation(location, AppPath.SyncEmails)
  ) {
    return AppPath.SyncEmails;
  }

  if (
    onboardingStatus === OnboardingStatus.INVITE_TEAM &&
    !isMatchingLocation(location, AppPath.InviteTeam)
  ) {
    return AppPath.InviteTeam;
  }

  if (
    onboardingStatus === OnboardingStatus.BOOK_ONBOARDING &&
    !someMatchingLocationOf([AppPath.BookCallDecision, AppPath.BookCall])
  ) {
    if (!isDefined(calendarBookingPageId)) {
      return defaultHomePagePath;
    }
    return AppPath.BookCallDecision;
  }

  if (
    onboardingStatus === OnboardingStatus.COMPLETED &&
    someMatchingLocationOf([...onboardingPaths, ...onGoingUserCreationPaths]) &&
    !isMatchingLocation(location, AppPath.ResetPassword) &&
    isLoggedIn
  ) {
    return defaultHomePagePath;
  }

  if (isMatchingLocation(location, AppPath.Index) && isLoggedIn) {
    return defaultHomePagePath;
  }

  if (
    isMatchingLocation(location, AppPath.RecordIndexPage) &&
    !isDefined(objectMetadataItem)
  ) {
    return AppPath.NotFound;
  }

  return;
};
