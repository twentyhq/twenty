import { type ReactNode } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { TableCell } from '@/ui/layout/table/components/TableCell';

type SettingsTableTextCellProps = {
  text?: string | null;
  startElement?: ReactNode;
  align?: 'left' | 'right';
};

export const SettingsTableTextCell = ({
  text,
  startElement,
  align,
}: SettingsTableTextCellProps) => (
  <TableCell
    align={align}
    gap={themeCssVariables.spacing[1]}
    overflow="hidden"
    whiteSpace="nowrap"
  >
    {startElement}
    <OverflowingTextWithTooltip text={text} />
  </TableCell>
);
