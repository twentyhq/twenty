import { type ReactNode } from 'react';

import { ApplicationDisplay } from '@/applications/components/ApplicationDisplay';
import { useResolvedApplicationDescription } from '@/applications/hooks/useResolvedApplicationDescription';
import { type ApplicationDisplayData } from '@/applications/types/ApplicationDisplayData';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { msg, t } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';

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

const SOURCE_TYPE_LABELS: Record<
  ApplicationRegistrationSourceType,
  MessageDescriptor
> = {
  [ApplicationRegistrationSourceType.LOCAL]: msg`Local`,
  [ApplicationRegistrationSourceType.NPM]: msg`NPM`,
  [ApplicationRegistrationSourceType.OAUTH_ONLY]: msg`OAuth`,
  [ApplicationRegistrationSourceType.TARBALL]: msg`Tarball`,
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
        {sourceType ? t(SOURCE_TYPE_LABELS[sourceType]) : t`Built-in`}
      </TableCell>
      <TableCell gap={themeCssVariables.spacing[2]} minWidth="0">
        <OverflowingTextWithTooltip text={descriptionSummary} />
        {hasUpdate === true && (
          <Tag color="blue" weight="medium" truncate={false}>
            {t`Update`}
          </Tag>
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
