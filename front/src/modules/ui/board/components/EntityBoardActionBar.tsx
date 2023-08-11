import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/action-bar/components/ActionBar';

import { selectedBoardCardIdsState } from '../states/selectedBoardCardIdsState';

export function EntityBoardActionBar() {
  const selectedBoardCards = useRecoilValue(selectedBoardCardIdsState);
  return <ActionBar selectedIds={selectedBoardCards}></ActionBar>;
}
