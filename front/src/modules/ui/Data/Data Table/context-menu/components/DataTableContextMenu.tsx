import React from 'react';
import { useRecoilValue } from 'recoil';

import { ContextMenu } from '@/ui/Navigation/Context Menu/components/ContextMenu';

import { selectedRowIdsSelector } from '../../states/selectors/selectedRowIdsSelector';

export const DataTableContextMenu = () => {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);
  return <ContextMenu selectedIds={selectedRowIds} />;
};
