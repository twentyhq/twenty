import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/components/action-bar/ActionBar';

import { selectedBoardCardsState } from '../states/selectedBoardCardsState';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

export function EntityBoardActionBar({ children }: OwnProps) {
  const selectedBoardCards = useRecoilValue(selectedBoardCardsState);
  return <ActionBar selectedIds={selectedBoardCards}>{children}</ActionBar>;
}
