import {
  IconBrandDocker,
  IconChartBar,
  IconStatusChange,
} from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import { useQuery } from '@apollo/client/react';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';

export const SettingsApplicationRegistrationInstallStats = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();

  const applicationRegistrationId = registration.id;

  const { data } = useQuery(FindAdminApplicationRegistrationStatsDocument, {
    client: apolloAdminClient,
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
  });

  const stats = data?.findAdminApplicationRegistrationStats;

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
      label: t`Active installs`,
      value: stats?.activeInstalls ?? '—',
    },
    {
      Icon: IconStatusChange,
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
