import { useRecoilState } from 'recoil';

import { isRightDrawerExpandedState } from '../states/isRightDrawerExpandedState';
import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerPages } from '../types/RightDrawerPages';

export function useRightDrawer() {
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const [, setIsRightDrawerExpanded] = useRecoilState(
    isRightDrawerExpandedState,
  );

  const [, setRightDrawerPage] = useRecoilState(rightDrawerPageState);

  function openRightDrawer(rightDrawerPage: RightDrawerPages) {
    setRightDrawerPage(rightDrawerPage);
    setIsRightDrawerExpanded(false);
    setIsRightDrawerOpen(true);
  }

  function closeRightDrawer() {
    setIsRightDrawerExpanded(false);
    setIsRightDrawerOpen(false);
  }

  return {
    openRightDrawer,
    closeRightDrawer,
  };
}
