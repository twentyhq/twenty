import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { workspaceAuthBypassProvidersState } from '@/workspace/states/workspaceAuthBypassProvidersState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { workspaceBypassModeState } from '@/workspace/states/workspaceBypassModeState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useWorkspaceBypass = () => {
  const workspaceAuthProviders = useAtomStateValue(workspaceAuthProvidersState);
  const workspaceAuthBypassProviders = useAtomStateValue(
    workspaceAuthBypassProvidersState,
  );
  const [workspaceBypassMode, setWorkspaceBypassMode] = useAtomState(
    workspaceBypassModeState,
  );

  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  const hasOnlySsoProvidersEnabled = (() => {
    if (!workspaceAuthProviders) {
      return false;
    }

    const { Sso, google, microsoft, password } = workspaceAuthProviders;

    return Sso.length > 0 && !google && !microsoft && !password;
  })();

  const hasBypassProvidersAvailable = (() => {
    if (!workspaceAuthBypassProviders) {
      return false;
    }

    const { google, microsoft, password } = workspaceAuthBypassProviders;

    return google || microsoft || password;
  })();

  const shouldOfferBypass =
    isOnAWorkspace && hasOnlySsoProvidersEnabled && hasBypassProvidersAvailable;

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
