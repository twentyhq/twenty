import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

import { ONBOARDING_PATHS } from '@/auth/constants/OnboardingPaths';
import { ONGOING_USER_CREATION_PATHS } from '@/auth/constants/OngoingUserCreationPaths';
import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

// An authenticated session with no active workspace — e.g. a workspace-agnostic
// token on the multi-workspace root domain — can never satisfy MinimalMetadataLoadEffect
// (which requires an active workspace), so MinimalMetadataGater would show its loader
// forever. This runs above the gater and routes such sessions to SignInUp, which on the
// root domain resolves to the workspace picker, instead of hanging on the loader.
const REDIRECT_EXCLUDED_PATHS = [
  ...ONGOING_USER_CREATION_PATHS,
  ...ONBOARDING_PATHS,
  AppPath.ResetPassword,
  AppPath.Authorize,
];

export const WorkspacelessSessionRedirectEffect = () => {
  const hasAccessTokenPair = useHasAccessTokenPair();
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for the current-user load to resolve so we don't redirect a valid
    // workspace session during the window before currentWorkspace is populated.
    if (!hasAccessTokenPair || !isCurrentUserLoaded) {
      return;
    }

    if (isWorkspaceActiveOrSuspended(currentWorkspace)) {
      return;
    }

    const isOnExcludedPath = REDIRECT_EXCLUDED_PATHS.some((appPath) =>
      isMatchingLocation(location, appPath),
    );

    if (isOnExcludedPath) {
      return;
    }

    navigate(AppPath.SignInUp);
  }, [
    hasAccessTokenPair,
    isCurrentUserLoaded,
    currentWorkspace,
    location,
    navigate,
  ]);

  return null;
};
