import { USAGE_OPERATION_TYPE_LABELS } from '@/settings/usage/constants/UsageOperationTypeLabels';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import {
  SettingsTableCard,
  type TableItem,
} from '@/settings/components/SettingsTableCard';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAlertTriangle,
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
import {
  type ApplicationRegistration,
  FindApplicationRegistrationStatsDocument,
} from '~/generated-metadata/graphql';

const OPERATION_LABELS: Partial<Record<string, MessageDescriptor>> =
  USAGE_OPERATION_TYPE_LABELS;

const StyledStatsLayout = styled.div`
  align-items: start;
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, calc(${themeCssVariables.spacing[10]} * 7)), 1fr)
  );
`;

const StyledStatsColumn = styled.div`
  min-width: 0;
`;

const StyledEmptyMessage = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  margin: ${themeCssVariables.spacing[2]} 0 0;
`;

type SettingsApplicationRegistrationInstallStatsProps = {
  registration: Pick<ApplicationRegistration, 'id'>;
  isAdminView?: boolean;
};

export const SettingsApplicationRegistrationInstallStats = ({
  registration,
  isAdminView = false,
}: SettingsApplicationRegistrationInstallStatsProps) => {
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
  const formatCount = (count?: number | null) =>
    isDefined(count) ? i18n.number(count) : '—';
  const formatCredits = (credits?: number | null) =>
    isDefined(credits)
      ? i18n.number(credits, { maximumFractionDigits: 6 })
      : '—';
  const versionDistribution =
    stats?.versionDistribution
      .map(({ version, count }) => `${version} (${formatCount(count)})`)
      .join(', ') || '—';
  const hasInstallations = (stats?.activeInstalls ?? 0) > 0;

  const statsItems: TableItem[] = [
    {
      Icon: IconBrandDocker,
      label: t`Installs`,
      value: formatCount(stats?.activeInstalls),
    },
  ];

  if (hasInstallations) {
    statsItems.push({
      Icon: IconRefresh,
      label: t`Auto update enabled`,
      value: formatCount(stats?.autoUpdateEnabled),
    });
  }

  if ((stats?.workspacesNeedingAttention ?? 0) > 0) {
    statsItems.push({
      Icon: IconAlertTriangle,
      label: t`Needs configuration`,
      value: (
        <Tooltip
          content={t`Based on connection authentication failures and recent app health warnings or errors. Unchecked workspaces have unknown health.`}
        >
          <span tabIndex={0}>
            {formatCount(stats?.workspacesNeedingAttention)}
          </span>
        </Tooltip>
      ),
    });
  }

  if ((stats?.suspendedInstalls ?? 0) > 0) {
    statsItems.push({
      Icon: IconPlayerPause,
      label: t`On suspended workspaces`,
      value: formatCount(stats?.suspendedInstalls),
    });
  }

  if (hasInstallations) {
    statsItems.push(
      {
        Icon: IconVersions,
        label: t`Most installed version`,
        value: stats?.mostInstalledVersion ?? '—',
      },
      {
        Icon: IconChartBar,
        label: t`Distribution`,
        value: <OverflowingTextWithTooltip text={versionDistribution} />,
      },
    );
  }

  const consumedOperations = stats?.creditBreakdown ?? [];

  const creditItems: TableItem[] = [
    {
      Icon: IconCoins,
      label: t`Total credits consumed`,
      value: (
        <Tooltip
          content={t`App-attributed credits across available usage history for current installations in non-deleted workspaces.`}
        >
          <span tabIndex={0}>{formatCredits(stats?.totalCreditsConsumed)}</span>
        </Tooltip>
      ),
    },
    ...consumedOperations.map((operation) => {
      const standardLabel = Object.hasOwn(
        OPERATION_LABELS,
        operation.operationType,
      )
        ? OPERATION_LABELS[operation.operationType]
        : undefined;

      return {
        label:
          operation.isAppDefined || !isDefined(standardLabel)
            ? operation.label
            : i18n._(standardLabel),
        value: formatCredits(operation.creditsConsumed),
      };
    }),
  ];

  return (
    <StyledStatsLayout>
      <StyledStatsColumn role="group" aria-label={t`Install statistics`}>
        <SettingsTableCard
          rounded
          items={statsItems}
          gridAutoColumns={`minmax(0, calc(${themeCssVariables.spacing[10]} * 5)) minmax(0, 1fr)`}
        />
        {stats?.activeInstalls === 0 && (
          <StyledEmptyMessage>{t`No installations yet.`}</StyledEmptyMessage>
        )}
      </StyledStatsColumn>
      {consumedOperations.length > 0 && (
        <StyledStatsColumn role="group" aria-label={t`Credit consumption`}>
          <SettingsTableCard
            rounded
            items={creditItems}
            gridAutoColumns={`minmax(0, calc(${themeCssVariables.spacing[10]} * 5)) minmax(0, 1fr)`}
          />
        </StyledStatsColumn>
      )}
    </StyledStatsLayout>
  );
};
