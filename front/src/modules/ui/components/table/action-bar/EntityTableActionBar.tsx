import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/components/action-bar/ActionBar';
import { selectedRowIdsState } from '@/ui/tables/states/selectedRowIdsState';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

export function EntityTableActionBar({ children }: OwnProps) {
  const selectedRowIds = useRecoilValue(selectedRowIdsState);

  return <ActionBar selectedIds={selectedRowIds}>{children}</ActionBar>;
}
