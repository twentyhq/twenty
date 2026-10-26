import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { ApplicationMonitoringLineChart } from '@/settings/application-monitoring/components/ApplicationMonitoringLineChart';
import { APPLICATION_MONITORING_CREDIT_SERIES_COLORS } from '@/settings/application-monitoring/constants/ApplicationMonitoringCreditSeriesColors';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { buildApplicationMonitoringCreditChartData } from '@/settings/application-monitoring/utils/buildApplicationMonitoringCreditChartData';
import { getApplicationMonitoringCreditsFormatOptions } from '@/settings/application-monitoring/utils/getApplicationMonitoringCreditsFormatOptions';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { getUsageOperationTypeLabel } from '@/settings/usage/utils/getUsageOperationTypeLabel';

type ApplicationMonitoringCreditsSectionProps = {
  monitoring: Pick<
    ApplicationMonitoringData,
    | 'creditsUsed'
    | 'creditUsage'
    | 'bucketSizeInSeconds'
    | 'periodStart'
    | 'periodEnd'
  >;
  axisLabel: string;
  isAdminView: boolean;
};

export const ApplicationMonitoringCreditsSection = ({
  monitoring,
  axisLabel,
  isAdminView,
}: ApplicationMonitoringCreditsSectionProps) => {
  const { t, i18n } = useLingui();
  const { creditsUsed, creditUsage } = monitoring;

  if (!isDefined(creditsUsed) || !isDefined(creditUsage)) {
    return (
      <Section.Root>
        <Section.Header title={t`Credits used`} />
        <SettingsEmptyPlaceholder>{t`Credits used could not be loaded. Refresh to try again.`}</SettingsEmptyPlaceholder>
      </Section.Root>
    );
  }

  const creditsUsedLabel = i18n.number(
    creditsUsed,
    getApplicationMonitoringCreditsFormatOptions(creditsUsed),
  );
  const creditChartData = buildApplicationMonitoringCreditChartData({
    ...monitoring,
    creditUsage,
  });

  return (
    <Section.Root>
      <Section.Header
        title={t`Credits used`}
        description={
          isAdminView
            ? t`${creditsUsedLabel} credits by operation type in this period`
            : t`${creditsUsedLabel} credits by operation type, across every install in this period`
        }
      />
      {creditUsage.length === 0 ? (
        <SettingsEmptyPlaceholder>{t`No credits used in this period`}</SettingsEmptyPlaceholder>
      ) : (
        <ApplicationMonitoringLineChart
          data={creditChartData.data}
          series={creditChartData.series.map(
            ({ key, operationType }, index) => {
              const operationTypeLabel =
                getUsageOperationTypeLabel(operationType);

              return {
                key,
                label: isDefined(operationTypeLabel)
                  ? i18n._(operationTypeLabel)
                  : operationType,
                color:
                  APPLICATION_MONITORING_CREDIT_SERIES_COLORS[
                    index % APPLICATION_MONITORING_CREDIT_SERIES_COLORS.length
                  ],
              };
            },
          )}
          axisLabel={axisLabel}
          getTotalFormatOptions={getApplicationMonitoringCreditsFormatOptions}
        />
      )}
    </Section.Root>
  );
};
