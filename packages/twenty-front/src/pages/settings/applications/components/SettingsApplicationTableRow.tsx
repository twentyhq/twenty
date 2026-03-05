import { type ReactNode } from 'react';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type ApplicationWithoutRelation } from '~/pages/settings/applications/types/applicationWithoutRelation';

export type SettingsApplicationTableRowProps = {
  action: ReactNode;
  application: ApplicationWithoutRelation;
  link?: string;
};

export const APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  '164px minmax(0, 1fr) 36px';

export const SettingsApplicationTableRow = ({
  action,
  application,
  link,
}: SettingsApplicationTableRowProps) => {
  return (
    <TableRow
      gridTemplateColumns={APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      key={application.id}
      to={link}
    >
      <TableCell
        color={themeCssVariables.font.color.secondary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        <OverflowingTextWithTooltip text={application.name} />
      </TableCell>
      <TableCell>
        <OverflowingTextWithTooltip text={application.description} />
      </TableCell>
      <TableCell align="right">{action}</TableCell>
    </TableRow>
  );
};
