import { type ApplicationMonitoringPeriod } from '@/settings/application-monitoring/types/ApplicationMonitoringPeriod';

export type ApplicationMonitoringPeriodRange = {
  period: ApplicationMonitoringPeriod;
  periodStart: string;
  periodEnd: string;
};
