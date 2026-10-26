import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { ApplicationMonitoringLineChart } from '@/settings/application-monitoring/components/ApplicationMonitoringLineChart';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { buildApplicationMonitoringCreditChartData } from '@/settings/application-monitoring/utils/buildApplicationMonitoringCreditChartData';
import { getApplicationMonitoringCreditsFormatOptions } from '@/settings/application-monitoring/utils/getApplicationMonitoringCreditsFormatOptions';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';

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
  const { t } = useLingui();
  const { creditsUsed, creditUsage } = monitoring;

  if (!isDefined(creditsUsed) || !isDefined(creditUsage)) {
    return (
      <Section.Root>
        <Section.Header title={t`Credits used`} />
        <SettingsEmptyPlaceholder>{t`Credits used could not be loaded. Refresh to try again.`}</SettingsEmptyPlaceholder>
      </Section.Root>
    );
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Credits used`}
        description={
          isAdminView ? undefined : t`Across every install in this period`
        }
      />
      {creditUsage.length === 0 ? (
        <SettingsEmptyPlaceholder>{t`No credits used in this period`}</SettingsEmptyPlaceholder>
      ) : (
        <ApplicationMonitoringLineChart
          data={buildApplicationMonitoringCreditChartData({
            ...monitoring,
            creditUsage,
          })}
          series={[{ key: 'creditsUsed', label: t`Credits`, color: 'purple' }]}
          axisLabel={axisLabel}
          getTotalFormatOptions={getApplicationMonitoringCreditsFormatOptions}
        />
      )}
    </Section.Root>
  );
};
