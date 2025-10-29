import { useCallback, useEffect, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { workspaceAuthBypassProvidersState } from '@/workspace/states/workspaceAuthBypassProvidersState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { workspaceBypassModeState } from '@/workspace/states/workspaceBypassModeState';

export const useWorkspaceBypass = () => {
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);
  const workspaceAuthBypassProviders = useRecoilValue(
    workspaceAuthBypassProvidersState,
  );
  const [workspaceBypassMode, setWorkspaceBypassMode] = useRecoilState(
    workspaceBypassModeState,
  );

  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  const isWorkspaceContext =
    isOnAWorkspace || isMultiWorkspaceEnabled === false;

  const hasOnlySSOProvidersEnabled = useMemo(() => {
    if (!workspaceAuthProviders) {
      return false;
    }

    return (
      workspaceAuthProviders.sso.length > 0 &&
      !workspaceAuthProviders.google &&
      !workspaceAuthProviders.microsoft &&
      !workspaceAuthProviders.password
    );
  }, [workspaceAuthProviders]);

  const hasBypassProvidersAvailable = useMemo(() => {
    if (!workspaceAuthBypassProviders) {
      return false;
    }

    const { google, microsoft, password } = workspaceAuthBypassProviders;

    return google || microsoft || password;
  }, [workspaceAuthBypassProviders]);

  const shouldOfferBypass =
    isWorkspaceContext &&
    hasOnlySSOProvidersEnabled &&
    hasBypassProvidersAvailable;

  useEffect(() => {
    if (!shouldOfferBypass && workspaceBypassMode) {
      setWorkspaceBypassMode(false);
    }
  }, [workspaceBypassMode, setWorkspaceBypassMode, shouldOfferBypass]);

  const enableBypass = useCallback(() => {
    if (shouldOfferBypass) {
      setWorkspaceBypassMode(true);
    }
  }, [setWorkspaceBypassMode, shouldOfferBypass]);

  const resetBypass = useCallback(() => {
    setWorkspaceBypassMode(false);
  }, [setWorkspaceBypassMode]);

  const shouldShowBypassLink = shouldOfferBypass && !workspaceBypassMode;

  return {
    isWorkspaceContext,
    workspaceBypassMode,
    shouldShowBypassLink,
    enableBypass,
    resetBypass,
  };
};
