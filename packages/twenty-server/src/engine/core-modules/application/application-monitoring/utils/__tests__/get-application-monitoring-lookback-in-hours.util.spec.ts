import {
  APPLICATION_MONITORING_RETENTION_IN_DAYS,
  EVENT_LOG_RETENTION,
} from 'twenty-shared/constants';

import { getApplicationMonitoringLookbackInHours } from 'src/engine/core-modules/application/application-monitoring/utils/get-application-monitoring-lookback-in-hours.util';

describe('getApplicationMonitoringLookbackInHours', () => {
  it('should cap Pro plans at their log retention', () => {
    expect(
      getApplicationMonitoringLookbackInHours({
        hasAuditLogsEntitlement: false,
      }),
    ).toBe(EVENT_LOG_RETENTION.proPlanInHours);
  });

  it('should give the full monitoring retention with the audit logs entitlement', () => {
    expect(
      getApplicationMonitoringLookbackInHours({
        hasAuditLogsEntitlement: true,
      }),
    ).toBe(APPLICATION_MONITORING_RETENTION_IN_DAYS * 24);
  });
});
