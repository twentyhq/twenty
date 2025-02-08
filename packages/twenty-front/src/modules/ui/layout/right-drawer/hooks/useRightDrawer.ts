import { useRecoilCallback, useRecoilValue } from 'recoil';

import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { rightDrawerCloseEventState } from '@/ui/layout/right-drawer/states/rightDrawerCloseEventsState';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { emitRightDrawerCloseEvent } from '@/ui/layout/right-drawer/utils/emitRightDrawerCloseEvent';
import { mapRightDrawerPageToCommandMenuPage } from '@/ui/layout/right-drawer/utils/mapRightDrawerPageToCommandMenuPage';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared';
import { IconComponent } from 'twenty-ui';
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

  const { navigateCommandMenu } = useCommandMenu();

  const openRightDrawer = useRecoilCallback(
    ({ set }) =>
      (
        rightDrawerPage: RightDrawerPages,
        commandMenuPageInfo: {
          title: string;
          Icon: IconComponent;
        },
      ) => {
        if (isCommandMenuV2Enabled) {
          const commandMenuPage =
            mapRightDrawerPageToCommandMenuPage(rightDrawerPage);

          navigateCommandMenu({
            page: commandMenuPage,
            pageTitle: commandMenuPageInfo.title,
            pageIcon: commandMenuPageInfo.Icon,
          });

          return;
        }

        set(rightDrawerPageState, rightDrawerPage);
        set(isRightDrawerOpenState, true);
        set(isRightDrawerMinimizedState, false);
      },
    [isCommandMenuV2Enabled, navigateCommandMenu],
  );

  const closeRightDrawer = useRecoilCallback(
    ({ set }) =>
      (args?: { emitCloseEvent?: boolean }) => {
        set(isRightDrawerOpenState, false);
        set(isRightDrawerMinimizedState, false);
        if (isDefined(args?.emitCloseEvent) && args?.emitCloseEvent) {
          emitRightDrawerCloseEvent();
        }
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
