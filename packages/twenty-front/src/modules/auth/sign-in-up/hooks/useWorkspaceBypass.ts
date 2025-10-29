import { useCallback, useEffect, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { workspaceAuthBypassProvidersState } from '@/workspace/states/workspaceAuthBypassProvidersState';
import { workspaceBypassModeState } from '@/workspace/states/workspaceBypassModeState';

export const useWorkspaceBypass = () => {
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);
  const workspaceAuthBypassProviders = useRecoilValue(
    workspaceAuthBypassProvidersState,
  );
  const [isBypassMode, setIsBypassMode] =
    useRecoilState(workspaceBypassModeState);

  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();
  const isMultiWorkspaceEnabled = useRecoilValue(
    isMultiWorkspaceEnabledState,
  );

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
    if (!shouldOfferBypass && isBypassMode) {
      setIsBypassMode(false);
    }
  }, [isBypassMode, setIsBypassMode, shouldOfferBypass]);

  const enableBypass = useCallback(() => {
    if (shouldOfferBypass) {
      setIsBypassMode(true);
    }
  }, [setIsBypassMode, shouldOfferBypass]);

  const resetBypass = useCallback(() => {
    setIsBypassMode(false);
  }, [setIsBypassMode]);

  const shouldShowBypassLink = shouldOfferBypass && !isBypassMode;

  return {
    isWorkspaceContext,
    isBypassMode,
    shouldShowBypassLink,
    enableBypass,
    resetBypass,
  };
};
