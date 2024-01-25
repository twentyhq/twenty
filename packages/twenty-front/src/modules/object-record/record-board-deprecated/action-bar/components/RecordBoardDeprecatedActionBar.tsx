import React from 'react';
import { useRecoilValue } from 'recoil';

import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

export const RecordBoardDeprecatedActionBar = () => {
  const { selectedCardIdsSelector } = useRecordBoardDeprecatedScopedStates();
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  return <ActionBar selectedIds={selectedCardIds}></ActionBar>;
};
