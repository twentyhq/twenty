import React from 'react';
import { useRecoilValue } from 'recoil';

import { ContextMenu } from '@/ui/navigation/context-menu/components/ContextMenu';

import { selectedRowIdsScopedSelector } from '../../states/selectors/selectedRowIdsScopedSelector';

export const RecordTableContextMenu = () => {
  const selectedRowIds = useRecoilValue(selectedRowIdsScopedSelector);
  return <ContextMenu selectedIds={selectedRowIds} />;
};
