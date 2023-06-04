import { useRecoilState } from 'recoil';

import { isRightDrawerOpenState } from '../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../states/rightDrawerPageState';
import { RightDrawerPage } from '../types/RightDrawerPage';

export function useOpenRightDrawer() {
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const [, setRightDrawerPage] = useRecoilState(rightDrawerPageState);

  return function openRightDrawer(rightDrawerPage: RightDrawerPage) {
    setRightDrawerPage(rightDrawerPage);
    setIsRightDrawerOpen(true);
  };
}
