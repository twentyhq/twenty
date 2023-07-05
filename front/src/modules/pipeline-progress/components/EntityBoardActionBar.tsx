import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/components/action-bar/ActionBar';

import { selectedBoardItemsState } from '../states/selectedBoardItemsState';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

export function EntityBoardActionBar({ children }: OwnProps) {
  const selectedBoardItems = useRecoilValue(selectedBoardItemsState);
  return <ActionBar selectedIds={selectedBoardItems}>{children}</ActionBar>;
}
