import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';
import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/internal/useRecordBoardScopedStates';

export const RecordBoardActionBar = () => {
  const { selectedCardIdsSelector } = useRecordBoardScopedStates();
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  return <ActionBar selectedIds={selectedCardIds}></ActionBar>;
};
