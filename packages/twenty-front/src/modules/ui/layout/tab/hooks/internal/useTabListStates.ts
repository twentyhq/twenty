import { TabListScopeInternalContext } from '@/ui/layout/tab/scopes/scope-internal-context/TabListScopeInternalContext';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

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
    activeTabIdState: extractComponentState(activeTabIdComponentState, scopeId),
  };
};
