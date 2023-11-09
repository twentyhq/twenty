import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { DialogManagerScopeInternalContext } from '../../scopes/scope-internal-context/DialogManagerScopeInternalContext';
import { dialogInternalScopedState } from '../../states/dialogInternalScopedState';

type useDialogManagerInternalProps = {
  dialogManagerScopeId?: string;
};

export const useDialogManagerInternal = (
  props?: useDialogManagerInternalProps,
) => {
  const scopeId = useAvailableScopeIdOrThrow(
    DialogManagerScopeInternalContext,
    props?.dialogManagerScopeId,
  );

  const [dialogInternal, setDialogInternal] = useRecoilScopedStateV2(
    dialogInternalScopedState,
    scopeId,
  );

  return { dialogInternal, setDialogInternal };
};
