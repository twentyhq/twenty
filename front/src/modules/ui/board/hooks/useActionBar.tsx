import { useSetRecoilState } from 'recoil';

import { actionBarEntriesState } from '@/ui/table/states/ActionBarEntriesState';

import { BoardActionBarButtonDeleteBoardCard } from '../components/BoardActionBarButtonDeleteBoardCard';

export function useOpenActionBar() {
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);

  return () => {
    setActionBarEntries([<BoardActionBarButtonDeleteBoardCard />]);
  };
}
