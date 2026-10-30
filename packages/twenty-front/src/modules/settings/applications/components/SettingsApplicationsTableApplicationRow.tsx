import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsApplicationTableRowChevronIcon } from '@/settings/applications/components/SettingsApplicationTableRowChevronIcon';
import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';
import { type SettingsApplicationsTableLinkTarget } from '@/settings/applications/types/SettingsApplicationsTableLinkTarget';
import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';
import { type SettingsApplicationsTableRowItem } from '@/settings/applications/types/SettingsApplicationsTableRowItem';
import { getSettingsApplicationLink } from '@/settings/applications/utils/getSettingsApplicationLink';

type SettingsApplicationsTableApplicationRowProps = {
  rowItem: SettingsApplicationsTableRowItem;
  linkTarget: SettingsApplicationsTableLinkTarget;
  middleColumn: SettingsApplicationTableRowMiddleColumn;
  statuses?: SettingsApplicationStatus[];
};

export const SettingsApplicationsTableApplicationRow = ({
  rowItem,
  linkTarget,
  middleColumn,
  statuses,
}: SettingsApplicationsTableApplicationRowProps) => {
  const shouldShowUpdateTag =
    middleColumn === 'type' &&
    (statuses ?? []).some((status) => status.type === 'updateAvailable');

  return (
    <SettingsApplicationTableRow
      application={rowItem}
      shouldShowUpdateTag={shouldShowUpdateTag}
      sourceType={rowItem.sourceType}
      middleColumn={middleColumn}
      statuses={statuses}
      action={<SettingsApplicationTableRowChevronIcon />}
      link={getSettingsApplicationLink({
        linkTarget,
        applicationId: rowItem.id,
      })}
    />
  );
};
