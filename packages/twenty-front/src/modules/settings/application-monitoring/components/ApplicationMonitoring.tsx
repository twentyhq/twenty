import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { APPLICATION_MONITORING_RETENTION_IN_DAYS } from 'twenty-shared/constants';
import { IconButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { IconRefresh } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { billingState } from '@/client-config/states/billingState';
import { ApplicationMonitoringCreditsSection } from '@/settings/application-monitoring/components/ApplicationMonitoringCreditsSection';
import { ApplicationMonitoringLineChart } from '@/settings/application-monitoring/components/ApplicationMonitoringLineChart';
import { ApplicationMonitoringFunctionsTable } from '@/settings/application-monitoring/components/ApplicationMonitoringFunctionsTable';
import { ApplicationMonitoringIssuesTable } from '@/settings/application-monitoring/components/ApplicationMonitoringIssuesTable';
import { ApplicationMonitoringKpis } from '@/settings/application-monitoring/components/ApplicationMonitoringKpis';
import { ApplicationMonitoringPeriodSelect } from '@/settings/application-monitoring/components/ApplicationMonitoringPeriodSelect';
import { ApplicationMonitoringVersionsTable } from '@/settings/application-monitoring/components/ApplicationMonitoringVersionsTable';
import { APPLICATION_MONITORING_PERIODS } from '@/settings/application-monitoring/constants/ApplicationMonitoringPeriods';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { type ApplicationMonitoringPeriod } from '@/settings/application-monitoring/types/ApplicationMonitoringPeriod';
import { buildApplicationMonitoringActivityChartData } from '@/settings/application-monitoring/utils/buildApplicationMonitoringActivityChartData';
import { buildApplicationMonitoringLifecycleChartData } from '@/settings/application-monitoring/utils/buildApplicationMonitoringLifecycleChartData';
import { getLargestAllowedApplicationMonitoringPeriod } from '@/settings/application-monitoring/utils/getLargestAllowedApplicationMonitoringPeriod';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledHealth = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledHeaderActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRetentionNotice = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type ApplicationMonitoringProps = {
  instanceId: string;
  monitoring: ApplicationMonitoringData;
  selectedPeriod: ApplicationMonitoringPeriod;
  onPeriodChange: (period: ApplicationMonitoringPeriod) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isAdminView?: boolean;
  additionalActions?: ReactNode;
};

export const ApplicationMonitoring = ({
  instanceId,
  monitoring,
  selectedPeriod,
  onPeriodChange,
  onRefresh,
  isRefreshing = false,
  isAdminView = false,
  additionalActions,
}: ApplicationMonitoringProps) => {
  const { t, i18n } = useLingui();
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  const fullRetentionInHours = APPLICATION_MONITORING_RETENTION_IN_DAYS * 24;
  const lookbackInHours = monitoring.lookbackInHours;
  const lookbackInHoursLabel = lookbackInHours.toString();
  const fullRetentionInDaysLabel =
    APPLICATION_MONITORING_RETENTION_IN_DAYS.toString();
  const displayedPeriod = getLargestAllowedApplicationMonitoringPeriod({
    period: selectedPeriod,
    lookbackInHours,
  });
  const chartAxisLabel = i18n._(
    APPLICATION_MONITORING_PERIODS.find(
      ({ value }) => value === displayedPeriod,
    )?.chartAxisLabel ?? APPLICATION_MONITORING_PERIODS[0].chartAxisLabel,
  );

  const activityChartData =
    buildApplicationMonitoringActivityChartData(monitoring);
  const lifecycleChartData =
    buildApplicationMonitoringLifecycleChartData(monitoring);

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Health`}
          actions={
            <StyledHeaderActions>
              {additionalActions}
              <IconButton
                size="sm"
                tooltip={t`Refresh`}
                aria-label={t`Refresh`}
                loading={isRefreshing}
                onClick={onRefresh}
              >
                <IconRefresh />
              </IconButton>
              <ApplicationMonitoringPeriodSelect
                dropdownId={`${instanceId}-period`}
                value={displayedPeriod}
                lookbackInHours={lookbackInHours}
                onChange={onPeriodChange}
              />
            </StyledHeaderActions>
          }
        />
        <StyledHealth>
          <ApplicationMonitoringKpis monitoring={monitoring} />
          {lookbackInHours < fullRetentionInHours && (
            <StyledRetentionNotice>
              {t`Your plan shows the last ${lookbackInHoursLabel} hours. The last ${fullRetentionInDaysLabel} days are kept and visible with the Audit logs entitlement.`}
            </StyledRetentionNotice>
          )}
          {monitoring.activity.length === 0 ? (
            <SettingsEmptyPlaceholder>{t`No activity in this period`}</SettingsEmptyPlaceholder>
          ) : (
            <ApplicationMonitoringLineChart
              data={activityChartData}
              series={[{ key: 'errorCount', label: t`Errors`, color: 'red' }]}
              axisLabel={chartAxisLabel}
            />
          )}
        </StyledHealth>
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Rate limits`}
          description={t`API requests rejected and trigger jobs skipped`}
        />
        {monitoring.rateLimitEventCount === 0 ? (
          <SettingsEmptyPlaceholder padding="2" textAlign="left">
            {t`No rate limit hit in this period`}
          </SettingsEmptyPlaceholder>
        ) : (
          <ApplicationMonitoringLineChart
            data={activityChartData}
            series={[
              {
                key: 'rateLimitedRequestCount',
                label: t`API requests`,
                color: 'orange',
              },
              { key: 'rateLimitedJobCount', label: t`Jobs`, color: 'blue' },
            ]}
            axisLabel={chartAxisLabel}
          />
        )}
      </Section.Root>
      {isBillingEnabled && (
        <ApplicationMonitoringCreditsSection
          monitoring={monitoring}
          axisLabel={chartAxisLabel}
          isAdminView={isAdminView}
        />
      )}
      <Section.Root>
        <Section.Header
          title={t`Top errors and warnings`}
          description={t`Grouped by error code and function`}
        />
        <ApplicationMonitoringIssuesTable
          issues={monitoring.issues}
          affectedLabel={isAdminView ? t`Workspaces` : t`Installs`}
        />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Installs, upgrades and uninstalls`}
          description={t`Lifecycle runs and their failures`}
        />
        {monitoring.lifecycle.length === 0 ? (
          <SettingsEmptyPlaceholder>{t`No install, upgrade or uninstall in this period`}</SettingsEmptyPlaceholder>
        ) : (
          <ApplicationMonitoringLineChart
            data={lifecycleChartData}
            series={[
              { key: 'failedCount', label: t`Failed`, color: 'red' },
              { key: 'installCount', label: t`Installed`, color: 'green' },
              { key: 'upgradeCount', label: t`Upgraded`, color: 'blue' },
              { key: 'uninstallCount', label: t`Uninstalled`, color: 'gray' },
            ]}
            axisLabel={chartAxisLabel}
          />
        )}
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Versions`}
          description={t`Runs and failures per version`}
        />
        <ApplicationMonitoringVersionsTable
          versions={monitoring.versions}
          activeLabel={isAdminView ? t`Workspaces` : t`Installs`}
        />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Functions`}
          description={t`Runs, failures and 95th percentile duration`}
        />
        <ApplicationMonitoringFunctionsTable functions={monitoring.functions} />
      </Section.Root>
    </>
  );
};
