import { verifyEmailRedirectPathState } from '@/app/states/verifyEmailRedirectPathState';
import { ONBOARDING_PATHS } from '@/auth/constants/OnboardingPaths';
import { ONGOING_USER_CREATION_PATHS } from '@/auth/constants/OngoingUserCreationPaths';
import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { returnToPathState } from '@/auth/states/returnToPathState';
import { billingState } from '@/client-config/states/billingState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
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
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  const someMatchingLocationOf = (appPaths: AppPath[]): boolean =>
    appPaths.some((appPath) => isMatchingLocation(location, appPath));

  const params = useParams();

  const objectNamePlural = params.objectNamePlural ?? '';
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const objectMetadataItem = objectMetadataItems?.find(
    (objectMetadataItem) => objectMetadataItem.namePlural === objectNamePlural,
  );
  const isMinimalMetadataReady = useAtomStateValue(isMinimalMetadataReadyState);

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
    !isMatchingLocation(location, AppPath.WorkspaceActivation)
  ) {
    return AppPath.WorkspaceActivation;
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
    onboardingStatus === OnboardingStatus.APPS_INSTALLATION &&
    !isMatchingLocation(location, AppPath.InstallApps)
  ) {
    return AppPath.InstallApps;
  }

  if (
    onboardingStatus === OnboardingStatus.INVITE_TEAM &&
    !isMatchingLocation(location, AppPath.InviteTeam)
  ) {
    return AppPath.InviteTeam;
  }

  if (isBillingEnabled && onboardingStatus === OnboardingStatus.COMPLETED) {
    if (isMatchingLocation(location, AppPath.InviteTeam)) {
      return AppPath.PlanRequired;
    }
    if (isMatchingLocation(location, AppPath.PlanRequired)) {
      return;
    }
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
    isMinimalMetadataReady &&
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
