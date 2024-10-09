import { useRecoilCallback } from 'recoil';

import { bottomBarHotkeyComponentState } from '@/ui/layout/bottom-bar/states/bottomBarHotkeyComponentState';
import { isBottomBarOpenedComponentState } from '@/ui/layout/bottom-bar/states/isBottomBarOpenedComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { isDefined } from '~/utils/isDefined';

export const useBottomBar = () => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const closeBottomBar = useRecoilCallback(
    ({ set }) =>
      (specificComponentId: string) => {
        goBackToPreviousHotkeyScope();
        set(
          isBottomBarOpenedComponentState.atomFamily({
            instanceId: specificComponentId,
          }),
          false,
        );
      },
    [goBackToPreviousHotkeyScope],
  );

  const openBottomBar = useRecoilCallback(
    ({ set, snapshot }) =>
      (specificComponentId: string, customHotkeyScope?: HotkeyScope) => {
        const bottomBarHotkeyScope = snapshot
          .getLoadable(
            bottomBarHotkeyComponentState.atomFamily({
              instanceId: specificComponentId,
            }),
          )
          .getValue();

        set(
          isBottomBarOpenedComponentState.atomFamily({
            instanceId: specificComponentId,
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
        const isBottomBarOpen = snapshot
          .getLoadable(
            isBottomBarOpenedComponentState.atomFamily({
              instanceId: specificComponentId,
            }),
          )
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
