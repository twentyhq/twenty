import React from 'react';
import { useRecoilValue } from 'recoil';

import { ContextMenu } from '@/ui/context-menu/components/ContextMenu';

import { selectedCardIdsSelector } from '../states/selectors/selectedCardIdsSelector';

export function EntityBoardContextMenu() {
  const selectedBoardCards = useRecoilValue(selectedCardIdsSelector);
  return <ContextMenu selectedIds={selectedBoardCards}></ContextMenu>;
}
