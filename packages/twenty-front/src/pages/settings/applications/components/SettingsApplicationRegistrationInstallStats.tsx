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
  FindApplicationRegistrationStatsDocument,
} from '~/generated-metadata/graphql';
import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import { useQuery } from '@apollo/client/react';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';

export const SettingsApplicationRegistrationInstallStats = ({
  registration,
  isAdminView = false,
}: {
  registration: ApplicationRegistration;
  isAdminView?: boolean;
}) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();

  const applicationRegistrationId = registration.id;

  const { data: adminData } = useQuery(
    FindAdminApplicationRegistrationStatsDocument,
    {
      client: apolloAdminClient,
      variables: { id: applicationRegistrationId },
      skip: !isAdminView || !applicationRegistrationId,
    },
  );

  const { data } = useQuery(FindApplicationRegistrationStatsDocument, {
    variables: { id: applicationRegistrationId },
    skip: isAdminView || !applicationRegistrationId,
  });

  const stats = isAdminView
    ? adminData?.findAdminApplicationRegistrationStats
    : data?.findApplicationRegistrationStats;

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
