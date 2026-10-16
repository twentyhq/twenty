import {
  IconBrandDocker,
  IconChartBar,
  IconPlayerPause,
  IconRefresh,
  IconVersions,
} from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { FindApplicationRegistrationStatsDocument } from '~/generated-metadata/graphql';
import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import { useQuery } from '@apollo/client/react';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';

export const SettingsApplicationRegistrationInstallStats = ({
  registration,
  isAdminView = false,
}: {
  registration: { id: string };
  isAdminView?: boolean;
}) => {
  const { t, i18n } = useLingui();
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
          `${entry.version} (${i18n.number(entry.count)})`,
      )
      .join(', ') || '—';

  const statsItems = [
    {
      Icon: IconBrandDocker,
      label: t`Installs`,
      value: stats ? i18n.number(stats.activeInstalls) : '—',
    },
    {
      Icon: IconRefresh,
      label: t`Auto update enabled`,
      value: stats ? i18n.number(stats.autoUpdateEnabled) : '—',
    },
    ...((stats?.suspendedInstalls ?? 0) > 0
      ? [
          {
            Icon: IconPlayerPause,
            label: t`On suspended workspaces`,
            value: i18n.number(stats?.suspendedInstalls ?? 0),
          },
        ]
      : []),
    {
      Icon: IconVersions,
      label: t`Most installed version`,
      value: stats?.mostInstalledVersion ?? '—',
    },
    {
      Icon: IconChartBar,
      label: t`Distribution`,
      value: <OverflowingTextWithTooltip text={versionDistributionLabel} />,
    },
  ];

  return (
    <SettingsTableCard
      rounded
      items={statsItems}
      gridAutoColumns="minmax(0, 200px) minmax(0, 1fr)"
    />
  );
};
