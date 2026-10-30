import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { getBuiltInAccountAppLogoUrl } from '@/settings/app-preferences/utils/getBuiltInAccountAppLogoUrl';
import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsApplicationTableRowChevronIcon } from '@/settings/applications/components/SettingsApplicationTableRowChevronIcon';
import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';
import { type SettingsApplicationsTableLinkTarget } from '@/settings/applications/types/SettingsApplicationsTableLinkTarget';
import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';
import { getSettingsApplicationLink } from '@/settings/applications/utils/getSettingsApplicationLink';
import { useLingui } from '@lingui/react/macro';

type SettingsApplicationsTableBuiltInAccountAppRowProps = {
  builtInAccountApp: BuiltInAccountApp;
  linkTarget: SettingsApplicationsTableLinkTarget;
  middleColumn: SettingsApplicationTableRowMiddleColumn;
  statuses?: SettingsApplicationStatus[];
};

export const SettingsApplicationsTableBuiltInAccountAppRow = ({
  builtInAccountApp,
  linkTarget,
  middleColumn,
  statuses,
}: SettingsApplicationsTableBuiltInAccountAppRowProps) => {
  const { t } = useLingui();

  return (
    <SettingsApplicationTableRow
      application={{
        name: t(builtInAccountApp.name),
        description: t(builtInAccountApp.description),
        logoUrl: getBuiltInAccountAppLogoUrl(builtInAccountApp),
      }}
      middleColumn={middleColumn}
      statuses={statuses}
      action={<SettingsApplicationTableRowChevronIcon />}
      link={getSettingsApplicationLink({
        linkTarget,
        applicationId: builtInAccountApp.id,
      })}
    />
  );
};
