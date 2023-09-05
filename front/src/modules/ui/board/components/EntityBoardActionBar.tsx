import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/action-bar/components/ActionBar';

import { selectedCardIdsSelector } from '../states/selectors/selectedCardIdsSelector';

export function EntityBoardActionBar() {
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  return <ActionBar selectedIds={selectedCardIds}></ActionBar>;
}
