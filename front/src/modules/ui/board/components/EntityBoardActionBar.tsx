import React from 'react';
import { useRecoilValue } from 'recoil';

import { ActionBar } from '@/ui/action-bar/components/ActionBar';

import { selectedCardIdsSelector } from '../states/selectors/selectedCardIdsSelector';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

export function EntityBoardActionBar({ children }: OwnProps) {
  const selectedCardIds = useRecoilValue(selectedCardIdsSelector);
  return <ActionBar selectedIds={selectedCardIds}>{children}</ActionBar>;
}
