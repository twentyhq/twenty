import { type ReactNode } from 'react';

import { ApplicationDisplay } from '@/applications/components/ApplicationDisplay';
import { useResolvedApplicationDescription } from '@/applications/hooks/useResolvedApplicationDescription';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';
import { Tag } from 'twenty-ui/components';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';
import { type ApplicationDisplayData } from '@/applications/types/applicationDisplayData.type';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

export type SettingsApplicationTableRowProps = {
  action: ReactNode;
  application: ApplicationDisplayData & {
    description?: string | null;
  };
  hasUpdate?: boolean;
  link?: string;
  sourceType?: ApplicationRegistrationSourceType;
};

export const APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  '164px 80px minmax(0, 1fr) 36px';

const SOURCE_TYPE_LABELS: Record<ApplicationRegistrationSourceType, string> = {
  [ApplicationRegistrationSourceType.LOCAL]: 'Local',
  [ApplicationRegistrationSourceType.NPM]: 'NPM',
  [ApplicationRegistrationSourceType.OAUTH_ONLY]: 'OAuth',
  [ApplicationRegistrationSourceType.TARBALL]: 'Tarball',
};

export const SettingsApplicationTableRow = ({
  action,
  application,
  hasUpdate,
  link,
  sourceType,
}: SettingsApplicationTableRowProps) => {
  const resolvedDescription = useResolvedApplicationDescription(application);
  const descriptionSummary =
    getApplicationDescriptionSummary(resolvedDescription);

  return (
    <TableRow
      gridTemplateColumns={APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      key={application.id}
      to={link}
    >
      <StyledNameTableCell minWidth="0" overflow="hidden">
        <ApplicationDisplay application={application} />
      </StyledNameTableCell>
      <TableCell color={themeCssVariables.font.color.tertiary}>
        {sourceType ? SOURCE_TYPE_LABELS[sourceType] : t`Seeded`}
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
