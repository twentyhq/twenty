import React from 'react';
import { useRecoilValue } from 'recoil';

import { ContextMenu } from '@/ui/navigation/context-menu/components/ContextMenu';

import { selectedCardIdsSelector } from '../../states/selectors/selectedCardIdsSelector';

export const RecordBoardContextMenu = () => {
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  return <ContextMenu selectedIds={selectedCardIds}></ContextMenu>;
};
