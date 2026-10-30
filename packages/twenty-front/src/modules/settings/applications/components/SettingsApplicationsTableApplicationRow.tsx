import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsApplicationTableRowChevronIcon } from '@/settings/applications/components/SettingsApplicationTableRowChevronIcon';
import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';
import { type SettingsApplicationsTableLinkTarget } from '@/settings/applications/types/SettingsApplicationsTableLinkTarget';
import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';
import { type SettingsApplicationsTableRowItem } from '@/settings/applications/types/SettingsApplicationsTableRowItem';
import { getSettingsApplicationLink } from '@/settings/applications/utils/getSettingsApplicationLink';

type SettingsApplicationsTableApplicationRowProps = {
  application: SettingsApplicationsTableRowItem;
  linkTarget: SettingsApplicationsTableLinkTarget;
  middleColumn: SettingsApplicationTableRowMiddleColumn;
  statuses?: SettingsApplicationStatus[];
};

export const SettingsApplicationsTableApplicationRow = ({
  application,
  linkTarget,
  middleColumn,
  statuses,
}: SettingsApplicationsTableApplicationRowProps) => {
  const shouldShowUpdateTag =
    middleColumn === 'type' &&
    (statuses ?? []).some((status) => status.type === 'updateAvailable');

  return (
    <SettingsApplicationTableRow
      application={application}
      shouldShowUpdateTag={shouldShowUpdateTag}
      sourceType={application.sourceType}
      middleColumn={middleColumn}
      statuses={statuses}
      action={<SettingsApplicationTableRowChevronIcon />}
      link={getSettingsApplicationLink({
        linkTarget,
        applicationId: application.id,
      })}
    />
  );
};
