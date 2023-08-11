import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/action-bar/components/ActionBar';

import { selectedRowIdsSelector } from '../../states/selectedRowIdsSelector';

export function EntityTableActionBar() {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  return <ActionBar selectedIds={selectedRowIds}></ActionBar>;
}
