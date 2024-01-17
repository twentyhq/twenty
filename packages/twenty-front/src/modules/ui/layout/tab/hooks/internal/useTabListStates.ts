import { TabListScopeInternalContext } from '@/ui/layout/tab/scopes/scope-internal-context/TabListScopeInternalContext';
import { activeTabIdStateScopeMap } from '@/ui/layout/tab/states/activeTabIdStateScopeMap';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

type useTabListStatesProps = {
  tabListScopeId?: string;
};

export const useTabListStates = ({ tabListScopeId }: useTabListStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    TabListScopeInternalContext,
    tabListScopeId,
  );

  return {
    scopeId,
    getActiveTabIdState: getState(activeTabIdStateScopeMap, scopeId),
  };
};
