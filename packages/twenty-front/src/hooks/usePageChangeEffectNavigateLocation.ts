import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { ONBOARDING_PATHS } from '@/auth/constants/OnboardingPaths';
import { ONGOING_USER_CREATION_PATHS } from '@/auth/constants/OngoingUserCreationPaths';
import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isOnboardingV2State } from '@/auth/states/isOnboardingV2State';
import { returnToPathState } from '@/auth/states/returnToPathState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';
import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useLocation, useParams } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import {
  FindOnePageLayoutTypeDocument,
  OnboardingStatus,
  PageLayoutType,
} from '~/generated-metadata/graphql';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const readReturnToPathFromUrlSearchParams = (): string | null => {
  const value = new URLSearchParams(window.location.search).get('returnToPath');

  return value && isValidReturnToPath(value) ? value : null;
};

export const usePageChangeEffectNavigateLocation = () => {
  const hasAccessTokenPair = useHasAccessTokenPair();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();
  const onboardingStatus = useOnboardingStatus();
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const location = useLocation();
  const calendarBookingPageId = useAtomStateValue(calendarBookingPageIdState);

  const someMatchingLocationOf = (appPaths: AppPath[]): boolean =>
    appPaths.some((appPath) => isMatchingLocation(location, appPath));

  const params = useParams();

  const objectNamePlural = params.objectNamePlural ?? '';
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const objectMetadataItem = objectMetadataItems?.find(
    (objectMetadataItem) => objectMetadataItem.namePlural === objectNamePlural,
  );

  const pageLayoutId = params.pageLayoutId;
  const isOnPageLayoutPage = isMatchingLocation(
    location,
    AppPath.PageLayoutPage,
  );

  const { data: pageLayoutData, loading: isPageLayoutLoading } = useQuery(
    FindOnePageLayoutTypeDocument,
    {
      variables: { id: pageLayoutId ?? '' },
      skip: !isOnPageLayoutPage || !isDefined(pageLayoutId),
    },
  );
  const verifyEmailRedirectPath = useAtomStateValue(
    verifyEmailRedirectPathState,
  );

  const returnToPath = useAtomStateValue(returnToPathState);
  const resolvedReturnToPath = isNonEmptyString(returnToPath)
    ? returnToPath
    : readReturnToPathFromUrlSearchParams();

  const isOnboardingV2 = useAtomStateValue(isOnboardingV2State);

  if (
    (!hasAccessTokenPair || !isOnAWorkspace || !isDefined(currentWorkspace)) &&
    !someMatchingLocationOf([
      ...ONGOING_USER_CREATION_PATHS,
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
      AppPath.WorkspaceActivation,
      AppPath.WorkspaceActivationV2,
      AppPath.BookCallDecision,
      AppPath.BookCall,
    ])
  ) {
    return isOnboardingV2
      ? AppPath.WorkspaceActivationV2
      : AppPath.WorkspaceActivation;
  }

  if (
    onboardingStatus === OnboardingStatus.PROFILE_CREATION &&
    !someMatchingLocationOf([AppPath.CreateProfile, AppPath.CreateProfileV2])
  ) {
    return isOnboardingV2 ? AppPath.CreateProfileV2 : AppPath.CreateProfile;
  }

  if (
    onboardingStatus === OnboardingStatus.SYNC_EMAIL &&
    !someMatchingLocationOf([AppPath.SyncEmails, AppPath.SyncEmailsV2])
  ) {
    return isOnboardingV2 ? AppPath.SyncEmailsV2 : AppPath.SyncEmails;
  }

  if (
    onboardingStatus === OnboardingStatus.INVITE_TEAM &&
    !someMatchingLocationOf([AppPath.InviteTeam, AppPath.InviteTeamV2])
  ) {
    return isOnboardingV2 ? AppPath.InviteTeamV2 : AppPath.InviteTeam;
  }

  if (
    isOnboardingV2 &&
    (onboardingStatus === OnboardingStatus.BOOK_ONBOARDING ||
      onboardingStatus === OnboardingStatus.COMPLETED)
  ) {
    if (
      !someMatchingLocationOf([
        AppPath.PlanRequiredV2,
        AppPath.PlanRequiredSuccess,
        AppPath.BookCall,
        AppPath.BookCallDecision,
      ])
    ) {
      return AppPath.PlanRequiredV2;
    }
    return;
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
    someMatchingLocationOf([
      ...ONBOARDING_PATHS,
      ...ONGOING_USER_CREATION_PATHS,
    ]) &&
    !isMatchingLocation(location, AppPath.ResetPassword) &&
    hasAccessTokenPair &&
    isOnAWorkspace
  ) {
    return resolvedReturnToPath ?? defaultHomePagePath;
  }

  if (isMatchingLocation(location, AppPath.Index) && hasAccessTokenPair) {
    return resolvedReturnToPath ?? defaultHomePagePath;
  }

  if (
    isMatchingLocation(location, AppPath.RecordIndexPage) &&
    !isDefined(objectMetadataItem)
  ) {
    return AppPath.NotFound;
  }

  if (
    isOnPageLayoutPage &&
    isDefined(pageLayoutId) &&
    !isPageLayoutLoading &&
    (!isDefined(pageLayoutData?.getPageLayout) ||
      pageLayoutData.getPageLayout.type !== PageLayoutType.STANDALONE_PAGE)
  ) {
    return AppPath.NotFound;
  }

  return;
};
