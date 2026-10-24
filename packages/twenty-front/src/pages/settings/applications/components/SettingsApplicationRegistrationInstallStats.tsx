import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

import { billingState } from '@/client-config/states/billingState';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { USAGE_LIMIT_OPERATION_TYPE_ICONS } from '@/settings/billing/constants/UsageLimitOperationTypeIcons';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';
import {
  type SettingsStatRow,
  SettingsStatsGrid,
} from '@/settings/components/SettingsStatsGrid';
import { getCurrentMonthPeriodDates } from '@/settings/usage/utils/getCurrentMonthPeriodDates';
import { getUsageOperationTypeLabel } from '@/settings/usage/utils/getUsageOperationTypeLabel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBrandDocker,
  IconChartBar,
  IconCoins,
  IconPlayerPause,
  IconRefresh,
  IconVersions,
} from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import { FindApplicationRegistrationStatsDocument } from '~/generated-metadata/graphql';

export const SettingsApplicationRegistrationInstallStats = ({
  registration,
  isAdminView = false,
}: {
  registration: { id: string };
  isAdminView?: boolean;
}) => {
  const { t, i18n } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const periodDates = getCurrentMonthPeriodDates();

  const applicationRegistrationId = registration.id;

  const { data: adminData } = useQuery(
    FindAdminApplicationRegistrationStatsDocument,
    {
      client: apolloAdminClient,
      variables: { id: applicationRegistrationId, ...periodDates },
      skip: !isAdminView || !applicationRegistrationId,
    },
  );

  const { data } = useQuery(FindApplicationRegistrationStatsDocument, {
    variables: { id: applicationRegistrationId, ...periodDates },
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

  const installStats: SettingsStatRow[] = [
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

  const formatCredits = (credits: number | null | undefined) =>
    isDefined(credits)
      ? i18n.number(credits, {
          maximumFractionDigits: credits >= 10 ? 0 : 2,
          roundingMode: 'trunc',
        })
      : '—';

  const creditsUsedStats: SettingsStatRow[] = [
    {
      Icon: IconCoins,
      label: t`Credits used this month`,
      value: (
        <Tooltip
          content={t`Usage attributed to this application in its current installing workspaces since the start of the month (UTC). Updated every ten minutes.`}
        >
          <span tabIndex={0}>{formatCredits(stats?.totalCreditsUsed)}</span>
        </Tooltip>
      ),
    },
    ...(stats?.creditsUsedBreakdown ?? []).map(
      ({ label, operation, creditsUsed }) => {
        const operationLabel = isDefined(operation)
          ? getUsageOperationTypeLabel(operation)
          : undefined;

        return {
          Icon:
            isDefined(operation) &&
            isKeyOfRecord(USAGE_LIMIT_OPERATION_TYPE_ICONS, operation)
              ? USAGE_LIMIT_OPERATION_TYPE_ICONS[operation]
              : IconCoins,
          label: isDefined(operationLabel)
            ? i18n._(operationLabel)
            : (label ?? operation ?? '—'),
          value: formatCredits(creditsUsed),
        };
      },
    ),
  ];

  return (
    <SettingsStatsGrid
      columns={
        isBillingEnabled ? [installStats, creditsUsedStats] : [installStats]
      }
    />
  );
};
