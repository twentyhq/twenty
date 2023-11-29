import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

import { selectedCardIdsScopedSelector } from '../../states/selectors/selectedCardIdsScopedSelector';

export const RecordBoardActionBar = () => {
  const selectedCardIds = useRecoilValue(selectedCardIdsScopedSelector);
  return <ActionBar selectedIds={selectedCardIds}></ActionBar>;
};
