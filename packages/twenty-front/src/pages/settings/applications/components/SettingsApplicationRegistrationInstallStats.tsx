import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAlertTriangle,
  IconChartBar,
  IconCheck,
  IconCoins,
  IconDownload,
  IconRefresh,
  IconVersions,
  IconWorld,
} from 'twenty-ui/icon';
import { Card, Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { FindAdminApplicationRegistrationStatsDocument } from '~/generated-admin/graphql';
import {
  type ApplicationRegistration,
  FindApplicationRegistrationStatsDocument,
} from '~/generated-metadata/graphql';

const StyledStatsGrid = styled.dl`
  display: grid;
  gap: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[6]};
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  margin: 0;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledStat = styled.div`
  min-width: 0;
`;

const StyledLabel = styled.dt`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  line-height: 1.5;

  svg {
    flex-shrink: 0;
  }
`;

const StyledValue = styled.dd`
  color: ${themeCssVariables.font.color.primary};
  margin: ${themeCssVariables.spacing[1]} 0 0;
  overflow-wrap: anywhere;
`;

const StyledDetail = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

type SettingsApplicationRegistrationInstallStatsProps = {
  registration: ApplicationRegistration;
  isAdminView?: boolean;
};

export const SettingsApplicationRegistrationInstallStats = ({
  registration,
  isAdminView = false,
}: SettingsApplicationRegistrationInstallStatsProps) => {
  const { t, i18n } = useLingui();
  const theme = useTheme();
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
  const total = stats?.activeInstalls;
  const formatCount = (count: number) => i18n.number(count);
  const formatRatio = (count?: number | null) =>
    isDefined(count) && isDefined(total)
      ? `${formatCount(count)} / ${formatCount(total)}`
      : '—';
  const latestVersionPercentage =
    isDefined(stats?.onLatestVersion) && isDefined(total) && total > 0
      ? i18n.number(stats.onLatestVersion / total, {
          style: 'percent',
          maximumFractionDigits: 0,
        })
      : null;

  const statsItems = [
    {
      Icon: IconWorld,
      label: t`Installed workspaces`,
      value: isDefined(total) ? formatCount(total) : '—',
      detail: isDefined(stats?.suspendedInstalls)
        ? t`${formatCount(stats.suspendedInstalls)} on suspended workspaces`
        : undefined,
    },
    {
      Icon: IconCheck,
      label: t`On latest version`,
      value: isDefined(latestVersionPercentage)
        ? `${formatRatio(stats?.onLatestVersion)} · ${latestVersionPercentage}`
        : formatRatio(stats?.onLatestVersion),
    },
    {
      Icon: IconDownload,
      label: t`Updates available`,
      value: isDefined(stats?.updatesAvailable)
        ? formatCount(stats.updatesAvailable)
        : '—',
    },
    {
      Icon: IconRefresh,
      label: t`Auto-update enabled`,
      value: formatRatio(stats?.autoUpdateEnabled),
    },
    {
      Icon: IconAlertTriangle,
      label: t`Needs configuration or reconnection`,
      value: formatRatio(stats?.workspacesNeedingAttention),
      detail: isDefined(stats)
        ? t`${formatCount(stats.healthCheckedWorkspaces)} / ${formatCount(stats.activeInstalls)} checked in the last 24 hours`
        : undefined,
      description: t`Workspaces with a connection authentication failure or a recent app health warning or error. Unchecked workspaces have unknown health. Apps must report their configuration issues through a health check.`,
    },
    {
      Icon: IconCoins,
      label: t`Total credits consumed`,
      value: isDefined(stats?.totalCreditsConsumed)
        ? i18n.number(stats.totalCreditsConsumed, { maximumFractionDigits: 2 })
        : '—',
      description: t`App-attributed credits across available usage history in non-deleted workspaces, including previous installations. Unavailable when usage storage cannot be queried.`,
    },
    {
      Icon: IconVersions,
      label: t`Most installed version`,
      value: stats?.mostInstalledVersion ?? '—',
    },
    {
      Icon: IconChartBar,
      label: t`Distribution`,
      value:
        stats?.versionDistribution
          .map(({ version, count }) => `${version} (${formatCount(count)})`)
          .join(', ') || '—',
    },
  ];

  return (
    <Card.Root rounded backgroundColor={themeCssVariables.background.secondary}>
      <StyledStatsGrid>
        {statsItems.map(({ Icon, label, value, detail, description }) => (
          <StyledStat key={label}>
            <StyledLabel>
              <Icon size={theme.icon.size.md} aria-hidden="true" />
              {label}
            </StyledLabel>
            <StyledValue>
              {isDefined(description) ? (
                <Tooltip content={description}>
                  <span tabIndex={0}>{value}</span>
                </Tooltip>
              ) : (
                value
              )}
              {isDefined(detail) && <StyledDetail>{detail}</StyledDetail>}
            </StyledValue>
          </StyledStat>
        ))}
      </StyledStatsGrid>
    </Card.Root>
  );
};
