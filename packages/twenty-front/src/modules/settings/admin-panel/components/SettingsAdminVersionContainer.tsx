import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminVersionDisplay } from '@/settings/admin-panel/components/SettingsAdminVersionDisplay';
import { IconCircleDot, IconVersions } from 'twenty-ui/icon';
import { useQuery } from '@apollo/client/react';
import { GetVersionInfoDocument } from '~/generated-admin/graphql';
import { useLingui } from '@lingui/react/macro';

export const SettingsAdminVersionContainer = () => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const { data, loading } = useQuery(GetVersionInfoDocument, {
    client: apolloAdminClient,
  });
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
      Icon: IconVersions,
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

  return <SettingsTableCard items={versionItems} gridAutoColumns="3fr 8fr" />;
};
