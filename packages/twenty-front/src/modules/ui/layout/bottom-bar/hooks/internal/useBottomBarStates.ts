import { BottomBarScopeInternalContext } from '@/ui/layout/bottom-bar/scopes/scope-internal-context/BottomBarScopeInternalContext';
import { bottomBarHotkeyComponentState } from '@/ui/layout/bottom-bar/states/bottomBarHotkeyComponentState';
import { isBottomBarOpenComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenComponentState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

type UseBottomBarStatesProps = {
  bottomBarScopeId?: string;
};

export const useBottomBarStates = ({
  bottomBarScopeId,
}: UseBottomBarStatesProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    BottomBarScopeInternalContext,
    bottomBarScopeId,
  );

  return {
    scopeId,
    bottomBarHotkeyScopeState: extractComponentState(
      bottomBarHotkeyComponentState,
      scopeId,
    ),
    isBottomBarOpenState: extractComponentState(
      isBottomBarOpenComponentState,
      scopeId,
    ),
  };
};
