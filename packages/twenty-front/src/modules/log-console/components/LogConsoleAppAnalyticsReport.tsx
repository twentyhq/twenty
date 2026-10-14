import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { LogConsoleAppAnalyticsBreakdownTable } from '@/log-console/components/LogConsoleAppAnalyticsBreakdownTable';
import { LogConsoleAppAnalyticsLineChartSection } from '@/log-console/components/LogConsoleAppAnalyticsLineChartSection';
import { LogConsoleAppAnalyticsTotals } from '@/log-console/components/LogConsoleAppAnalyticsTotals';
import { type LogConsoleAppAnalyticsRange } from '@/log-console/types/LogConsoleAppAnalyticsRange';
import { getLogConsoleAppAnalyticsPeriod } from '@/log-console/utils/getLogConsoleAppAnalyticsPeriod';
import { useApplicationRegistrationAnalytics } from '@/settings/application-registrations/hooks/useApplicationRegistrationAnalytics';
import { buildApplicationRegistrationAnalyticsLineSeries } from '@/settings/application-registrations/utils/buildApplicationRegistrationAnalyticsLineSeries';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';

type LogConsoleAppAnalyticsReportProps = {
  applicationRegistrationId: string;
  registrationCreatedAt: string;
  range: LogConsoleAppAnalyticsRange;
};

export const LogConsoleAppAnalyticsReport = ({
  applicationRegistrationId,
  registrationCreatedAt,
  range,
}: LogConsoleAppAnalyticsReportProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { formatUsageValue } = useUsageValueFormatter();

  const { periodStart, periodEnd } = getLogConsoleAppAnalyticsPeriod({
    range,
    now: new Date().toISOString(),
    registrationCreatedAt,
  });

  const { analytics, isInitialLoading, error } =
    useApplicationRegistrationAnalytics({
      applicationRegistrationId,
      periodStart,
      periodEnd,
    });

  if (isInitialLoading) {
    return <UsageSectionSkeleton />;
  }

  if (isDefined(error)) {
    return (
      <SettingsEmptyPlaceholder>
        {t`Something went wrong while loading analytics. Please try again.`}
      </SettingsEmptyPlaceholder>
    );
  }

  if (!isDefined(analytics)) {
    return (
      <SettingsEmptyPlaceholder>{t`No analytics could be loaded.`}</SettingsEmptyPlaceholder>
    );
  }

  const formatCount = (value: number) => formatNumber(value);

  const lifecycleSeries = buildApplicationRegistrationAnalyticsLineSeries({
    timeSeries: analytics.timeSeries,
    seriesDefinitions: [
      { key: 'installs', label: t`Installs`, field: 'installSucceeded' },
      { key: 'upgrades', label: t`Upgrades`, field: 'upgradeSucceeded' },
      { key: 'uninstalls', label: t`Uninstalls`, field: 'uninstallSucceeded' },
    ],
  });

  const executionSeries = buildApplicationRegistrationAnalyticsLineSeries({
    timeSeries: analytics.timeSeries,
    seriesDefinitions: [
      { key: 'executions', label: t`Executions`, field: 'functionExecutions' },
      { key: 'errors', label: t`Errors`, field: 'functionErrors' },
    ],
  });

  const rateLimitSeries = buildApplicationRegistrationAnalyticsLineSeries({
    timeSeries: analytics.timeSeries,
    seriesDefinitions: [
      { key: 'api', label: t`API requests`, field: 'apiRateLimited' },
      { key: 'jobs', label: t`Job enqueues`, field: 'jobRateLimited' },
    ],
  });

  const revenueSeries = buildApplicationRegistrationAnalyticsLineSeries({
    timeSeries: analytics.timeSeries,
    seriesDefinitions: [
      { key: 'credits', label: t`Credits`, field: 'creditsCharged' },
    ],
  });

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Overview`}
          description={t`Aggregated per UTC day across every workspace this app is installed in. The current day is still accumulating, and workspaces are never identified.`}
        />
        <LogConsoleAppAnalyticsTotals totals={analytics.totals} />
      </Section.Root>
      <LogConsoleAppAnalyticsLineChartSection
        title={t`Installs`}
        description={t`Successful installs, upgrades and uninstalls per day.`}
        chartId="log-console-app-analytics-lifecycle"
        series={lifecycleSeries}
        formatValue={formatCount}
      />
      <LogConsoleAppAnalyticsLineChartSection
        title={t`Function executions`}
        description={t`Logic function runs and failures per day.`}
        chartId="log-console-app-analytics-executions"
        series={executionSeries}
        formatValue={formatCount}
      />
      <LogConsoleAppAnalyticsLineChartSection
        title={t`Rate limits`}
        description={t`API requests and job enqueues refused per day because the app exceeded its limits.`}
        chartId="log-console-app-analytics-rate-limits"
        series={rateLimitSeries}
        formatValue={formatCount}
      />
      <LogConsoleAppAnalyticsLineChartSection
        title={t`Revenue`}
        description={t`Credits charged to workspaces by this app per day, before any revenue share.`}
        chartId="log-console-app-analytics-revenue"
        series={revenueSeries}
        formatValue={formatUsageValue}
      />
      <LogConsoleAppAnalyticsBreakdownTable
        title={t`Errors by category`}
        description={t`Logic function failures grouped by error category.`}
        keyHeader={t`Error category`}
        valueHeader={t`Errors`}
        items={analytics.functionErrorsByType}
        formatValue={formatCount}
      />
      <LogConsoleAppAnalyticsBreakdownTable
        title={t`Errors by function`}
        description={t`Logic function failures grouped by function.`}
        keyHeader={t`Function`}
        valueHeader={t`Errors`}
        items={analytics.functionErrorsByFunction}
        formatValue={formatCount}
      />
      <LogConsoleAppAnalyticsBreakdownTable
        title={t`Executions by function`}
        description={t`Logic function runs grouped by function.`}
        keyHeader={t`Function`}
        valueHeader={t`Executions`}
        items={analytics.functionExecutionsByFunction}
        formatValue={formatCount}
      />
      <LogConsoleAppAnalyticsBreakdownTable
        title={t`Install failures by error code`}
        description={t`Failed installs, upgrades and uninstalls grouped by error code.`}
        keyHeader={t`Error code`}
        valueHeader={t`Failures`}
        items={analytics.lifecycleFailuresByErrorCode}
        formatValue={formatCount}
      />
      <LogConsoleAppAnalyticsBreakdownTable
        title={t`Revenue by operation`}
        description={t`Credits charged grouped by the operation the app declared.`}
        keyHeader={t`Operation`}
        valueHeader={t`Credits`}
        items={analytics.creditsChargedByOperation}
        formatValue={formatUsageValue}
      />
    </>
  );
};
