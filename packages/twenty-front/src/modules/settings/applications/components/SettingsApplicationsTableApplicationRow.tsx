import { ApplicationDisplay } from '@/applications/components/ApplicationDisplay';
import { useResolvedApplicationDescription } from '@/applications/hooks/useResolvedApplicationDescription';
import { type ApplicationDisplayData } from '@/applications/types/ApplicationDisplayData';
import { SettingsApplicationStatusCell } from '@/settings/applications/components/SettingsApplicationStatusCell';
import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsApplicationTableRowChevronIcon } from '@/settings/applications/components/SettingsApplicationTableRowChevronIcon';
import { SettingsApplicationTypeOrStatusCell } from '@/settings/applications/components/SettingsApplicationTypeOrStatusCell';
import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';
import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';
import { getApplicationDescriptionSummary } from '@/settings/applications/utils/getApplicationDescriptionSummary';
import { type MessageDescriptor } from '@lingui/core';
import { msg, t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

const SOURCE_TYPE_LABELS: Record<
  ApplicationRegistrationSourceType,
  MessageDescriptor
> = {
  [ApplicationRegistrationSourceType.LOCAL]: msg`Local`,
  [ApplicationRegistrationSourceType.NPM]: msg`NPM`,
  [ApplicationRegistrationSourceType.OAUTH_ONLY]: msg`OAuth`,
  [ApplicationRegistrationSourceType.TARBALL]: msg`Tarball`,
};

const getSourceTypeLabel = (sourceType?: ApplicationRegistrationSourceType) =>
  isDefined(sourceType) ? t(SOURCE_TYPE_LABELS[sourceType]) : t`Built-in`;

type SettingsApplicationsTableApplicationRowProps = {
  application: ApplicationDisplayData & {
    description?: string | null;
    sourceType?: ApplicationRegistrationSourceType;
  };
  link: string;
  middleColumn?: SettingsApplicationTableRowMiddleColumn;
  statuses?: SettingsApplicationStatus[];
};

export const SettingsApplicationsTableApplicationRow = ({
  application,
  link,
  middleColumn = 'type',
  statuses = [],
}: SettingsApplicationsTableApplicationRowProps) => {
  const resolvedDescription = useResolvedApplicationDescription(application);
  const sourceTypeLabel = getSourceTypeLabel(application.sourceType);
  const shouldShowUpdateTag =
    middleColumn === 'type' &&
    statuses.some((status) => status.type === 'updateAvailable');

  const middleByColumn: Record<
    SettingsApplicationTableRowMiddleColumn,
    ReactNode
  > = {
    type: sourceTypeLabel,
    status: <SettingsApplicationStatusCell statuses={statuses} />,
    typeOrStatus: (
      <SettingsApplicationTypeOrStatusCell
        typeLabel={sourceTypeLabel}
        statuses={statuses}
      />
    ),
  };

  return (
    <SettingsApplicationTableRow
      middleColumn={middleColumn}
      link={link}
      name={<ApplicationDisplay application={application} />}
      middle={middleByColumn[middleColumn]}
      details={
        <>
          <OverflowingTextWithTooltip
            text={getApplicationDescriptionSummary(resolvedDescription)}
          />
          {shouldShowUpdateTag && (
            <Tag color="blue" weight="medium" truncate={false}>
              {t`Update`}
            </Tag>
          )}
        </>
      }
      action={<SettingsApplicationTableRowChevronIcon />}
    />
  );
};
