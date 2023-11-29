import React from 'react';
import { useRecoilValue } from 'recoil';

import { ContextMenu } from '@/ui/navigation/context-menu/components/ContextMenu';

import { selectedCardIdsScopedSelector } from '../../states/selectors/selectedCardIdsScopedSelector';

export const RecordBoardContextMenu = () => {
  const selectedCardIds = useRecoilValue(selectedCardIdsScopedSelector);
  return <ContextMenu selectedIds={selectedCardIds}></ContextMenu>;
};
