import React from 'react';
import { useRecoilValue } from 'recoil';

import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

export const RecordBoardActionBar = () => {
  const { selectedCardIdsSelector } = useRecordBoardScopedStates();
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  return <ActionBar selectedIds={selectedCardIds}></ActionBar>;
};
