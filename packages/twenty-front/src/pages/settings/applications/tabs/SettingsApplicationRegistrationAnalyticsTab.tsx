import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useApplicationRegistrationAnalytics } from '@/settings/application-registrations/hooks/useApplicationRegistrationAnalytics';
import { buildApplicationRegistrationAnalyticsLineSeries } from '@/settings/application-registrations/utils/buildApplicationRegistrationAnalyticsLineSeries';
import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationAnalyticsBreakdownTable } from '~/pages/settings/applications/components/SettingsApplicationRegistrationAnalyticsBreakdownTable';
import { SettingsApplicationRegistrationAnalyticsLineChartSection } from '~/pages/settings/applications/components/SettingsApplicationRegistrationAnalyticsLineChartSection';
import { SettingsApplicationRegistrationAnalyticsTotals } from '~/pages/settings/applications/components/SettingsApplicationRegistrationAnalyticsTotals';

export const SettingsApplicationRegistrationAnalyticsTab = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();
  const { formatUsageValue } = useUsageValueFormatter();
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const {
    analytics,
    isInitialLoading,
    error,
    period,
    setPeriod,
    periodOptions,
  } = useApplicationRegistrationAnalytics({
    applicationRegistrationId: registration.id,
    skip: !isClickHouseConfigured,
  });

  const title = t`Overview`;
  const description = t`Aggregated across every workspace this app is installed in. Workspaces are never identified.`;

  if (!isClickHouseConfigured) {
    return (
      <Section.Root>
        <Section.Header title={title} description={description} />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`ClickHouse Not Configured`}
            value={t`App analytics require ClickHouse. Contact your administrator.`}
          />
        </SubscriptionInfoContainer>
      </Section.Root>
    );
  }

  if (isInitialLoading) {
    return <UsageSectionSkeleton />;
  }

  if (!isDefined(analytics)) {
    return (
      <Section.Root>
        <Section.Header title={title} description={description} />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`Analytics unavailable`}
            value={error?.message ?? t`No analytics could be loaded.`}
          />
        </SubscriptionInfoContainer>
      </Section.Root>
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
          title={title}
          description={description}
          actions={
            <Select
              dropdownId="application-registration-analytics-period"
              value={period}
              options={periodOptions}
              onChange={setPeriod}
              needIconCheck
              selectSizeVariant="small"
            />
          }
        />
        <SettingsApplicationRegistrationAnalyticsTotals
          totals={analytics.totals}
        />
      </Section.Root>
      <SettingsApplicationRegistrationAnalyticsLineChartSection
        title={t`Installs`}
        description={t`Successful installs, upgrades and uninstalls per day.`}
        chartId="application-registration-lifecycle"
        series={lifecycleSeries}
        formatValue={formatCount}
      />
      <SettingsApplicationRegistrationAnalyticsLineChartSection
        title={t`Function executions`}
        description={t`Logic function runs and failures per day.`}
        chartId="application-registration-executions"
        series={executionSeries}
        formatValue={formatCount}
      />
      <SettingsApplicationRegistrationAnalyticsLineChartSection
        title={t`Rate limits`}
        description={t`API requests and job enqueues refused per day because the app exceeded its limits.`}
        chartId="application-registration-rate-limits"
        series={rateLimitSeries}
        formatValue={formatCount}
      />
      <SettingsApplicationRegistrationAnalyticsLineChartSection
        title={t`Revenue`}
        description={t`Credits charged to workspaces by this app per day, before any revenue share.`}
        chartId="application-registration-revenue"
        series={revenueSeries}
        formatValue={formatUsageValue}
      />
      <SettingsApplicationRegistrationAnalyticsBreakdownTable
        title={t`Errors by type`}
        description={t`Logic function failures grouped by error type.`}
        keyHeader={t`Error type`}
        valueHeader={t`Errors`}
        items={analytics.functionErrorsByType}
        formatValue={formatCount}
      />
      <SettingsApplicationRegistrationAnalyticsBreakdownTable
        title={t`Errors by function`}
        description={t`Logic function failures grouped by function.`}
        keyHeader={t`Function`}
        valueHeader={t`Errors`}
        items={analytics.functionErrorsByFunction}
        formatValue={formatCount}
      />
      <SettingsApplicationRegistrationAnalyticsBreakdownTable
        title={t`Executions by function`}
        description={t`Logic function runs grouped by function.`}
        keyHeader={t`Function`}
        valueHeader={t`Executions`}
        items={analytics.functionExecutionsByFunction}
        formatValue={formatCount}
      />
      <SettingsApplicationRegistrationAnalyticsBreakdownTable
        title={t`Install failures by error code`}
        description={t`Failed installs, upgrades and uninstalls grouped by error code.`}
        keyHeader={t`Error code`}
        valueHeader={t`Failures`}
        items={analytics.lifecycleFailuresByErrorCode}
        formatValue={formatCount}
      />
      <SettingsApplicationRegistrationAnalyticsBreakdownTable
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
