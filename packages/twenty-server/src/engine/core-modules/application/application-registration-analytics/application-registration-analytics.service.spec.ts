import { type ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { type ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { ApplicationRegistrationAnalyticsService } from 'src/engine/core-modules/application/application-registration-analytics/application-registration-analytics.service';
import { hashWorkspaceIdForApplicationRegistrationMetric } from 'src/engine/core-modules/application/application-registration-analytics/utils/hash-workspace-id-for-application-registration-metric.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const APP_SECRET = 'app-secret';

const buildService = () => {
  const selectOrThrow = jest.fn().mockResolvedValue([]);

  const service = new ApplicationRegistrationAnalyticsService(
    { selectOrThrow } as unknown as ClickHouseService,
    {
      get: jest.fn().mockReturnValue(APP_SECRET),
    } as unknown as TwentyConfigService,
    {} as ApplicationLookupService,
  );

  return { service, selectOrThrow };
};

describe('ApplicationRegistrationAnalyticsService', () => {
  const period = {
    applicationRegistrationId: 'registration-id',
    periodStart: new Date('2026-10-01T00:00:00.000Z'),
    periodEnd: new Date('2026-10-03T00:00:00.000Z'),
  };

  it('should report across every workspace when no workspace is given', async () => {
    const { service, selectOrThrow } = buildService();

    await service.getAnalytics(period);

    expect(selectOrThrow).toHaveBeenCalled();

    for (const [, queryParams] of selectOrThrow.mock.calls) {
      expect(queryParams.workspaceHash).toBe('');
    }
  });

  it('should restrict every query to the hash of the given workspace', async () => {
    const { service, selectOrThrow } = buildService();

    await service.getAnalytics({ ...period, workspaceId: 'workspace-id' });

    const workspaceHash = hashWorkspaceIdForApplicationRegistrationMetric({
      workspaceId: 'workspace-id',
      secret: APP_SECRET,
    });

    expect(selectOrThrow).toHaveBeenCalled();

    for (const [query, queryParams] of selectOrThrow.mock.calls) {
      expect(query).toContain('workspaceHash = {workspaceHash:String}');
      expect(queryParams.workspaceHash).toBe(workspaceHash);
    }
  });
});
