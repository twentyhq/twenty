import { useSetRecoilState } from 'recoil';

import { actionBarEntriesState } from '@/ui/action-bar/states/actionBarEntriesState';

import { BoardActionBarButtonDeleteBoardCard } from '../components/BoardActionBarButtonDeleteBoardCard';

export function useBoardActionBarEntries() {
  const setActionBarEntries = useSetRecoilState(actionBarEntriesState);

  return {
    setActionBarEntries: () =>
      setActionBarEntries([
        <BoardActionBarButtonDeleteBoardCard key="delete" />,
      ]),
  };
}
