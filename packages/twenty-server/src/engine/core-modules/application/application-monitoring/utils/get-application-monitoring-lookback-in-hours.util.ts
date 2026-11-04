import {
  APPLICATION_MONITORING_RETENTION_IN_DAYS,
  EVENT_LOG_RETENTION,
} from 'twenty-shared/constants';

export const getApplicationMonitoringLookbackInHours = ({
  hasAuditLogsEntitlement,
}: {
  hasAuditLogsEntitlement: boolean;
}): number =>
  hasAuditLogsEntitlement
    ? APPLICATION_MONITORING_RETENTION_IN_DAYS * 24
    : EVENT_LOG_RETENTION.proPlanInHours;
