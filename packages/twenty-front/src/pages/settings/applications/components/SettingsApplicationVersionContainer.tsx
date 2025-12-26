import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { SettingsAdminVersionDisplay } from '@/settings/admin-panel/components/SettingsAdminVersionDisplay';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCircleDot, IconStatusChange } from 'twenty-ui/display';
import type { Application } from '~/generated/graphql';

export const SettingsApplicationVersionContainer = ({
  application,
}: {
  application?: Omit<Application, 'objects' | 'universalIdentifier'> & {
    objects: { id: string }[];
  };
}) => {
  const loading = !isDefined(application);

  const currentVersion = application?.version;

  // TODO fetch latestVersion of the application
  //  if published on twenty public application registry
  const latestVersion = currentVersion;

  const versionItems = [
    {
      Icon: IconCircleDot,
      label: t`Current version`,
      value: (
        <SettingsAdminVersionDisplay
          version={currentVersion}
          loading={loading}
          noVersionMessage={t`Unknown`}
        />
      ),
    },
    {
      Icon: IconStatusChange,
      label: t`Latest version`,
      value: (
        <SettingsAdminVersionDisplay
          version={latestVersion}
          loading={loading}
          noVersionMessage={t`No latest version found`}
        />
      ),
    },
  ];

  return (
    <SettingsAdminTableCard
      rounded
      items={versionItems}
      gridAutoColumns="3fr 8fr"
    />
  );
};
