import { TabListScopeInternalContext } from '@/ui/layout/tab/scopes/scope-internal-context/TabListScopeInternalContext';
import { activeTabIdComponentStateV1 } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

type useTabListStatesProps = {
  tabListScopeId?: string;
};

export const useTabListStatesV1 = ({
  tabListScopeId,
}: useTabListStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    TabListScopeInternalContext,
    tabListScopeId,
  );

  return {
    scopeId,
    activeTabIdState: extractComponentState(
      activeTabIdComponentStateV1,
      scopeId,
    ),
  };
};
