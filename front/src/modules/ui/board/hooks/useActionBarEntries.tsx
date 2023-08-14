import { useSetRecoilState } from 'recoil';

import { actionBarEntriesState } from '@/ui/action-bar/states/ActionBarEntriesState';

import { BoardActionBarButtonDeleteBoardCard } from '../components/BoardActionBarButtonDeleteBoardCard';

export function useActionBarEntries() {
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);

  return () => {
    setActionBarEntries([<BoardActionBarButtonDeleteBoardCard key="delete" />]);
  };
}
