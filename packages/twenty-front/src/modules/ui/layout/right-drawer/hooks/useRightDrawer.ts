import { useRecoilCallback, useRecoilState } from 'recoil';

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
  return {
    rightDrawerPage,
    isRightDrawerOpen,
    openRightDrawer,
    closeRightDrawer,
  };
};
