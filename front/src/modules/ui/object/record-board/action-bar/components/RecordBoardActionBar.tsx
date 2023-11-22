import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

import { selectedCardIdsSelector } from '../../states/selectors/selectedCardIdsSelector';

export const RecordBoardActionBar = () => {
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  return <ActionBar selectedIds={selectedCardIds}></ActionBar>;
};
