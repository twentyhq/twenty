import { useRecoilCallback } from 'recoil';

import { bottomBarHotkeyComponentState } from '@/ui/layout/bottom-bar/states/bottomBarHotkeyComponentState';
import { isBottomBarOpenComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { isDefined } from '~/utils/isDefined';

export const useBottomBar = () => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const closeBottomBar = useRecoilCallback(
    ({ set }) =>
      (specificComponentId: string) => {
        const scopeId = getScopeIdFromComponentId(specificComponentId);

        goBackToPreviousHotkeyScope();
        set(
          isBottomBarOpenComponentState({
            scopeId,
          }),
          false,
        );
      },
    [goBackToPreviousHotkeyScope],
  );

  const openBottomBar = useRecoilCallback(
    ({ set, snapshot }) =>
      (specificComponentId: string, customHotkeyScope?: HotkeyScope) => {
        const scopeId = getScopeIdFromComponentId(specificComponentId);

        const bottomBarHotkeyScope = snapshot
          .getLoadable(bottomBarHotkeyComponentState({ scopeId }))
          .getValue();

        set(
          isBottomBarOpenComponentState({
            scopeId,
          }),
          true,
        );

        if (isDefined(customHotkeyScope)) {
          setHotkeyScopeAndMemorizePreviousScope(
            customHotkeyScope.scope,
            customHotkeyScope.customScopes,
          );
        } else if (isDefined(bottomBarHotkeyScope)) {
          setHotkeyScopeAndMemorizePreviousScope(
            bottomBarHotkeyScope.scope,
            bottomBarHotkeyScope.customScopes,
          );
        }
      },
    [setHotkeyScopeAndMemorizePreviousScope],
  );

  const toggleBottomBar = useRecoilCallback(
    ({ snapshot }) =>
      (specificComponentId: string) => {
        const scopeId = getScopeIdFromComponentId(specificComponentId);
        const isBottomBarOpen = snapshot
          .getLoadable(isBottomBarOpenComponentState({ scopeId }))
          .getValue();

        if (isBottomBarOpen) {
          closeBottomBar(specificComponentId);
        } else {
          openBottomBar(specificComponentId);
        }
      },
    [closeBottomBar, openBottomBar],
  );

  return {
    closeBottomBar,
    openBottomBar,
    toggleBottomBar,
  };
};
