import { useRecoilState } from 'recoil';

import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerPages } from '../types/RightDrawerPages';

export function useOpenRightDrawer() {
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const [, setRightDrawerPage] = useRecoilState(rightDrawerPageState);

  return function openRightDrawer(rightDrawerPage: RightDrawerPages) {
    setRightDrawerPage(rightDrawerPage);
    setIsRightDrawerOpen(true);
  };
}
