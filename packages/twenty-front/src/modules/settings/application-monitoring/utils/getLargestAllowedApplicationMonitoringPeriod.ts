import { APPLICATION_MONITORING_PERIODS } from '@/settings/application-monitoring/constants/ApplicationMonitoringPeriods';
import { type ApplicationMonitoringPeriod } from '@/settings/application-monitoring/types/ApplicationMonitoringPeriod';

export const getLargestAllowedApplicationMonitoringPeriod = ({
  period,
  lookbackInHours,
}: {
  period: ApplicationMonitoringPeriod;
  lookbackInHours: number;
}): ApplicationMonitoringPeriod => {
  const allowedPeriods = APPLICATION_MONITORING_PERIODS.filter(
    ({ hours }) => hours <= lookbackInHours,
  );
  const requestedPeriod = allowedPeriods.find(({ value }) => value === period);

  return (
    requestedPeriod?.value ??
    allowedPeriods.at(-1)?.value ??
    APPLICATION_MONITORING_PERIODS[0].value
  );
};
