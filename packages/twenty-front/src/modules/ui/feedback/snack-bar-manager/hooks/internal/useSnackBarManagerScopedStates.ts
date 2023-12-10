import { SnackBarManagerScopeInternalContext } from '@/ui/feedback/snack-bar-manager/scopes/scope-internal-context/SnackBarManagerScopeInternalContext';
import { snackBarInternalScopedState } from '@/ui/feedback/snack-bar-manager/states/snackBarInternalScopedState';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type useSnackBarManagerScopedStatesProps = {
  snackBarManagerScopeId?: string;
};

export const useSnackBarManagerScopedStates = (
  props?: useSnackBarManagerScopedStatesProps,
) => {
  const scopeId = useAvailableScopeIdOrThrow(
    SnackBarManagerScopeInternalContext,
    props?.snackBarManagerScopeId,
  );

  const [snackBarInternal, setSnackBarInternal] = useRecoilScopedStateV2(
    snackBarInternalScopedState,
    scopeId,
  );

  return { snackBarInternal, setSnackBarInternal };
};
