import { useRecoilCallback, useRecoilValue } from 'recoil';

import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { rightDrawerCloseEventState } from '@/ui/layout/right-drawer/states/rightDrawerCloseEventsState';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { emitRightDrawerCloseEvent } from '@/ui/layout/right-drawer/utils/emitRightDrawerCloseEvent';
import { mapRightDrawerPageToCommandMenuPage } from '@/ui/layout/right-drawer/utils/mapRightDrawerPageToCommandMenuPage';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';
import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerPages } from '../types/RightDrawerPages';

export const useRightDrawer = () => {
  const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);
  const isRightDrawerMinimized = useRecoilValue(isRightDrawerMinimizedState);

  const rightDrawerPage = useRecoilValue(rightDrawerPageState);

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  const { openCommandMenu } = useCommandMenu();

  const openRightDrawer = useRecoilCallback(
    ({ set }) =>
      (rightDrawerPage: RightDrawerPages) => {
        if (isCommandMenuV2Enabled) {
          const commandMenuPage =
            mapRightDrawerPageToCommandMenuPage(rightDrawerPage);

          set(commandMenuPageState, commandMenuPage);
          openCommandMenu();
          return;
        }

        set(rightDrawerPageState, rightDrawerPage);
        set(isRightDrawerOpenState, true);
        set(isRightDrawerMinimizedState, false);
      },
    [isCommandMenuV2Enabled, openCommandMenu],
  );

  const closeRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isRightDrawerOpenState, false);
        set(isRightDrawerMinimizedState, false);
        emitRightDrawerCloseEvent();
      },
    [],
  );

  const minimizeRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isRightDrawerOpenState, true);
        set(isRightDrawerMinimizedState, true);
      },
    [],
  );

  const maximizeRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isRightDrawerMinimizedState, false);
        set(isRightDrawerOpenState, true);
      },
    [],
  );

  const isSameEventThanRightDrawerClose = useRecoilCallback(
    ({ snapshot }) =>
      (event: MouseEvent | TouchEvent) => {
        const rightDrawerCloseEvent = snapshot
          .getLoadable(rightDrawerCloseEventState)
          .getValue();

        const isSameEvent =
          rightDrawerCloseEvent?.target === event.target &&
          rightDrawerCloseEvent?.timeStamp === event.timeStamp;

        return isSameEvent;
      },
    [],
  );

  return {
    rightDrawerPage,
    isRightDrawerOpen,
    isRightDrawerMinimized,
    openRightDrawer,
    closeRightDrawer,
    minimizeRightDrawer,
    maximizeRightDrawer,
    isSameEventThanRightDrawerClose,
  };
};
