import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { workspaceAuthBypassProvidersState } from '@/workspace/states/workspaceAuthBypassProvidersState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { workspaceBypassModeState } from '@/workspace/states/workspaceBypassModeState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const useWorkspaceBypass = () => {
  const workspaceAuthProviders = useRecoilValueV2(workspaceAuthProvidersState);
  const workspaceAuthBypassProviders = useRecoilValueV2(
    workspaceAuthBypassProvidersState,
  );
  const [workspaceBypassMode, setWorkspaceBypassMode] = useRecoilStateV2(
    workspaceBypassModeState,
  );

  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  const hasOnlySSOProvidersEnabled = (() => {
    if (!workspaceAuthProviders) {
      return false;
    }

    const { sso, google, microsoft, password } = workspaceAuthProviders;

    return sso.length > 0 && !google && !microsoft && !password;
  })();

  const hasBypassProvidersAvailable = (() => {
    if (!workspaceAuthBypassProviders) {
      return false;
    }

    const { google, microsoft, password } = workspaceAuthBypassProviders;

    return google || microsoft || password;
  })();

  const shouldOfferBypass =
    isOnAWorkspace && hasOnlySSOProvidersEnabled && hasBypassProvidersAvailable;

  const shouldUseBypass = shouldOfferBypass ? workspaceBypassMode : false;

  const enableBypass = () => {
    if (shouldOfferBypass) {
      setWorkspaceBypassMode(true);
    }
  };

  return {
    shouldOfferBypass,
    shouldUseBypass,
    enableBypass,
  };
};
