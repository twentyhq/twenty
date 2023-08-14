import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/action-bar/components/ActionBar';

import { selectedRowIdsSelector } from '../../states/selectors/selectedRowIdsSelector';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

export function EntityTableActionBar({ children }: OwnProps) {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  return <ActionBar selectedIds={selectedRowIds}>{children}</ActionBar>;
}
