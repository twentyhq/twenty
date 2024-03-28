import { useRecoilCallback, useRecoilState } from 'recoil';

import { rightDrawerCloseEventState } from '@/ui/layout/right-drawer/states/rightDrawerCloseEventsState';

import { isRightDrawerExpandedState } from '../states/isRightDrawerExpandedState';
import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerPages } from '../types/RightDrawerPages';

export const useRightDrawer = () => {
  const [isRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);

  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  const openRightDrawer = useRecoilCallback(
    ({ set }) =>
      (rightDrawerPage: RightDrawerPages) => {
        set(rightDrawerPageState, rightDrawerPage);
        set(isRightDrawerExpandedState, false);
        set(isRightDrawerOpenState, true);
      },
    [],
  );

  const closeRightDrawer = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isRightDrawerExpandedState, false);
        set(isRightDrawerOpenState, false);
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
    openRightDrawer,
    closeRightDrawer,
    isSameEventThanRightDrawerClose,
  };
};
