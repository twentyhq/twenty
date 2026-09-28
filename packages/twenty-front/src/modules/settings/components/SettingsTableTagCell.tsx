import { type ReactNode } from 'react';

import { TableCell } from '@/ui/layout/table/components/TableCell';

type SettingsTableTagCellProps = {
  children?: ReactNode;
};

export const SettingsTableTagCell = ({
  children,
}: SettingsTableTagCellProps) => (
  <TableCell overflow="hidden" whiteSpace="nowrap">
    {children}
  </TableCell>
);
