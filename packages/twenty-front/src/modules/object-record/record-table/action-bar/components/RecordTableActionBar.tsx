import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

import { selectedRowIdsScopedSelector } from '../../states/selectors/selectedRowIdsScopedSelector';

export const RecordTableActionBar = () => {
  const selectedRowIds = useRecoilValue(selectedRowIdsScopedSelector);

  return <ActionBar selectedIds={selectedRowIds} />;
};
