import {
  IconBrandDocker,
  IconChartBar,
  IconPlayerPause,
  IconVersions,
} from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import {
  type ApplicationRegistration,
  type ApplicationRegistrationStats,
  FindApplicationRegistrationStatsDocument,
} from '~/generated-metadata/graphql';
import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import { useQuery } from '@apollo/client/react';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';

type SettingsApplicationRegistrationInstallStatsProps = {
  registration: ApplicationRegistration;
  fromAdmin?: boolean;
};

export const SettingsApplicationRegistrationInstallStats = ({
  registration,
  fromAdmin = false,
}: SettingsApplicationRegistrationInstallStatsProps) =>
  fromAdmin ? (
    <AdminInstallStats applicationRegistrationId={registration.id} />
  ) : (
    <OwnerInstallStats applicationRegistrationId={registration.id} />
  );

const AdminInstallStats = ({
  applicationRegistrationId,
}: {
  applicationRegistrationId: string;
}) => {
  const apolloAdminClient = useApolloAdminClient();
  const { data } = useQuery(FindAdminApplicationRegistrationStatsDocument, {
    client: apolloAdminClient,
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
  });

  return (
    <InstallStatsCard stats={data?.findAdminApplicationRegistrationStats} />
  );
};

const OwnerInstallStats = ({
  applicationRegistrationId,
}: {
  applicationRegistrationId: string;
}) => {
  const { data } = useQuery(FindApplicationRegistrationStatsDocument, {
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
  });

  return <InstallStatsCard stats={data?.findApplicationRegistrationStats} />;
};

const InstallStatsCard = ({
  stats,
}: {
  stats?: ApplicationRegistrationStats;
}) => {
  const { t } = useLingui();

  const versionDistributionLabel =
    stats?.versionDistribution
      ?.map(
        (entry: { version: string; count: number }) =>
          `${entry.version} (${entry.count})`,
      )
      .join(', ') || '—';

  const statsItems = [
    {
      Icon: IconBrandDocker,
      label: t`Installs`,
      value: stats?.activeInstalls ?? '—',
    },
    {
      Icon: IconPlayerPause,
      label: t`On suspended workspaces`,
      value: stats?.suspendedInstalls ?? '—',
    },
    {
      Icon: IconVersions,
      label: t`Most installed version`,
      value: stats?.mostInstalledVersion ?? '—',
    },
    {
      Icon: IconChartBar,
      label: t`Distribution`,
      value: versionDistributionLabel,
    },
  ];

  return (
    <SettingsTableCard rounded items={statsItems} gridAutoColumns="200px 1fr" />
  );
};
