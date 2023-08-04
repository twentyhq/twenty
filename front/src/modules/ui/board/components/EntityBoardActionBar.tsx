import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/action-bar/components/ActionBar';

import { selectedBoardCardIdsState } from '../states/selectedBoardCardIdsState';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

export function EntityBoardActionBar({ children }: OwnProps) {
  const selectedBoardCards = useRecoilValue(selectedBoardCardIdsState);
  return <ActionBar selectedIds={selectedBoardCards}>{children}</ActionBar>;
}
