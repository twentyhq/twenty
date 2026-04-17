import { type ReactNode } from 'react';

import { t } from '@lingui/core/macro';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { Tag } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type ApplicationWithoutRelation } from '~/pages/settings/applications/types/applicationWithoutRelation';

export type SettingsApplicationTableRowProps = {
  action: ReactNode;
  application: ApplicationWithoutRelation;
  hasUpdate?: boolean;
  link?: string;
};

export const APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  '164px minmax(0, 1fr) 36px';

export const SettingsApplicationTableRow = ({
  action,
  application,
  hasUpdate,
  link,
}: SettingsApplicationTableRowProps) => {
  return (
    <TableRow
      gridTemplateColumns={APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      key={application.id}
      to={link}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        <OverflowingTextWithTooltip text={application.name} />
      </TableCell>
      <TableCell gap={themeCssVariables.spacing[2]} minWidth="0">
        <OverflowingTextWithTooltip text={application.description} />
        {hasUpdate === true && (
          <Tag color="blue" text={t`Update`} weight="medium" />
        )}
      </TableCell>
      <TableCell
        align="right"
        padding={`0 ${themeCssVariables.spacing[2]} 0 0`}
        color={themeCssVariables.font.color.tertiary}
      >
        {action}
      </TableCell>
    </TableRow>
  );
};
