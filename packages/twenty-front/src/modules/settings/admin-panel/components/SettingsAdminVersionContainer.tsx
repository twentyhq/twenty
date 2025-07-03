import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { SettingsAdminVersionDisplay } from '@/settings/admin-panel/components/SettingsAdminVersionDisplay';
import { t } from '@lingui/core/macro';
import { IconCircleDot, IconStatusChange } from 'twenty-ui/display';
import { useGetVersionInfoQuery } from '~/generated-metadata/graphql';

export const SettingsAdminVersionContainer = () => {
  const { data, loading } = useGetVersionInfoQuery();
  const { currentVersion, latestVersion } = data?.versionInfo ?? {};

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
