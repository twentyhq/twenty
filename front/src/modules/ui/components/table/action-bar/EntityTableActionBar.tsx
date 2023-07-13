import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/components/action-bar/ActionBar';
import { selectedRowIdsSelector } from '@/ui/tables/states/selectedRowIdsSelector';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

export function EntityTableActionBar({ children }: OwnProps) {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  return <ActionBar selectedIds={selectedRowIds}>{children}</ActionBar>;
}
