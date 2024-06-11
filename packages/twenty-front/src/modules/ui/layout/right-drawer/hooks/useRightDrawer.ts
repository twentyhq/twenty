import { useRecoilCallback, useRecoilState } from 'recoil';

import { isRightDrawerMinimizedState } from '@/ui/layout/right-drawer/states/isRightDrawerMinimizedState';
import { rightDrawerCloseEventState } from '@/ui/layout/right-drawer/states/rightDrawerCloseEventsState';

import { isRightDrawerExpandedState } from '../states/isRightDrawerExpandedState';
import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerPages } from '../types/RightDrawerPages';

export const useRightDrawer = () => {
  const [isRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const [isRightDrawerExpanded] = useRecoilState(isRightDrawerExpandedState);
  const [isRightDrawerMinimized] = useRecoilState(isRightDrawerMinimizedState);

  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  const openRightDrawer = useRecoilCallback(
    ({ set }) =>
      (rightDrawerPage: RightDrawerPages) => {
        set(rightDrawerPageState, rightDrawerPage);
        set(isRightDrawerExpandedState, false);
        set(isRightDrawerOpenState, true);
        set(isRightDrawerMinimizedState, false);
      },
    [],
  );

  const closeRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isRightDrawerExpandedState, false);
        set(isRightDrawerOpenState, false);
        set(isRightDrawerMinimizedState, false);
      },
    [],
  );

  const minimizeRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isRightDrawerExpandedState, false);
        set(isRightDrawerOpenState, true);
        set(isRightDrawerMinimizedState, true);
      },
    [],
  );

  const maximizeRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isRightDrawerMinimizedState, false);
        set(isRightDrawerExpandedState, false);
        set(isRightDrawerOpenState, true);
      },
    [],
  );

  const expandRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isRightDrawerExpandedState, true);
        set(isRightDrawerOpenState, true);
        set(isRightDrawerMinimizedState, false);
      },
    [],
  );

  const downsizeRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isRightDrawerExpandedState, false);
        set(isRightDrawerOpenState, true);
        set(isRightDrawerMinimizedState, false);
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
    isRightDrawerExpanded,
    isRightDrawerMinimized,
    openRightDrawer,
    closeRightDrawer,
    minimizeRightDrawer,
    maximizeRightDrawer,
    expandRightDrawer,
    downsizeRightDrawer,
    isSameEventThanRightDrawerClose,
  };
};
