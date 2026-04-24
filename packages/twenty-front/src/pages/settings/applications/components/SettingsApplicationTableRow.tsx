import { type ReactNode } from 'react';

import { useApplicationAvatarColors } from '@/applications/hooks/useApplicationAvatarColors';
import { useResolvedApplicationDescription } from '@/applications/hooks/useResolvedApplicationDescription';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';
import { Tag } from 'twenty-ui/components';
import { Avatar, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type ApplicationWithoutRelation } from '~/pages/settings/applications/types/applicationWithoutRelation';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';

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
  const colors = useApplicationAvatarColors(application);
  const resolvedDescription = useResolvedApplicationDescription(application);
  const descriptionSummary =
    getApplicationDescriptionSummary(resolvedDescription);

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
        <Avatar
          type="app"
          size="md"
          placeholder={application.name}
          placeholderColorSeed={
            application.universalIdentifier ?? application.name
          }
          color={colors?.color}
          backgroundColor={colors?.backgroundColor}
          borderColor={colors?.borderColor}
        />
        <OverflowingTextWithTooltip text={application.name} />
      </TableCell>
      <TableCell gap={themeCssVariables.spacing[2]} minWidth="0">
        <OverflowingTextWithTooltip text={descriptionSummary} />
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
