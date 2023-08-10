import React from 'react';
import { useRecoilValue } from 'recoil';

import { ContextMenu } from '@/ui/context-menu/components/ContextMenu';

import { selectedRowIdsSelector } from '../../states/selectedRowIdsSelector';

type OwnProps = {
  children: React.ReactNode | React.ReactNode[];
};

export function EntityTableContextMenu({ children }: OwnProps) {
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  return <ContextMenu selectedIds={selectedRowIds}>{children}</ContextMenu>;
}
