import { APPLICATION_MONITORING_PERIODS } from '@/settings/application-monitoring/constants/ApplicationMonitoringPeriods';
import { type ApplicationMonitoringPeriod } from '@/settings/application-monitoring/types/ApplicationMonitoringPeriod';
import { type ApplicationMonitoringPeriodRange } from '@/settings/application-monitoring/types/ApplicationMonitoringPeriodRange';

const HOUR_IN_MS = 60 * 60 * 1000;

export const buildApplicationMonitoringPeriodRange = ({
  period,
  now = new Date(),
}: {
  period: ApplicationMonitoringPeriod;
  now?: Date;
}): ApplicationMonitoringPeriodRange => {
  const hours =
    APPLICATION_MONITORING_PERIODS.find(({ value }) => value === period)
      ?.hours ?? 0;

  return {
    period,
    periodStart: new Date(now.getTime() - hours * HOUR_IN_MS).toISOString(),
    periodEnd: now.toISOString(),
  };
};
