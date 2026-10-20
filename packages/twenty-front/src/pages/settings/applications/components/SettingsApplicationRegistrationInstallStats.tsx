import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { getUsageOperationTypeLabel } from '@/settings/usage/utils/getUsageOperationTypeLabel';
import { getPeriodDates } from '@/settings/usage/utils/getPeriodDates';
import { getPeriodOptions } from '@/settings/usage/utils/getPeriodOptions';
import { type PeriodPreset } from '@/settings/usage/utils/periodPreset';
import { Select } from '@/ui/input/components/Select';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
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
import { themeCssVariables } from 'twenty-ui/theme';
import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import { FindApplicationRegistrationStatsDocument } from '~/generated-metadata/graphql';

const StyledStats = styled.div`
  align-items: start;
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
`;

export const SettingsApplicationRegistrationInstallStats = ({
  registration,
  isAdminView = false,
}: {
  registration: { id: string };
  isAdminView?: boolean;
}) => {
  const { t, i18n } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const [period, setPeriod] = useState<PeriodPreset>('30d');
  const periodDates = getPeriodDates(period);

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

  const formatCredits = (credits: number | null | undefined) =>
    isDefined(credits)
      ? i18n.number(credits, { maximumFractionDigits: 6 })
      : '—';

  const creditsUsedItems = [
    {
      Icon: IconCoins,
      label: t`Total credits used`,
      value: (
        <Tooltip
          content={t`Usage attributed to this application in its current installing workspaces for the selected period. Updated every ten minutes.`}
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
          label: isDefined(operationLabel)
            ? i18n._(operationLabel)
            : (label ?? operation ?? '—'),
          value: formatCredits(creditsUsed),
        };
      },
    ),
  ];

  return (
    <StyledStats>
      <div role="group" aria-label={t`Install statistics`}>
        <SettingsTableCard
          items={statsItems}
          gridAutoColumns="minmax(0, 200px) minmax(0, 1fr)"
        />
      </div>
      <div role="group" aria-label={t`Credit consumption`}>
        <Section.Header
          title={t`Credits used`}
          actions={
            <Select
              dropdownId={`application-registration-credits-period-${applicationRegistrationId}`}
              value={period}
              options={getPeriodOptions()}
              onChange={setPeriod}
              needIconCheck
              selectSizeVariant="small"
            />
          }
        />
        <SettingsTableCard
          items={creditsUsedItems}
          gridAutoColumns="minmax(0, 200px) minmax(0, 1fr)"
        />
      </div>
    </StyledStats>
  );
};
