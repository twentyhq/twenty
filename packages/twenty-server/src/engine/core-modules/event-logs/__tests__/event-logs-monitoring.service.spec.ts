import { ForbiddenException } from '@nestjs/common';
import { EventLogTable } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { type BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { type ApplicationLogScopeService } from 'src/engine/core-modules/event-logs/application-monitoring/application-log-scope.service';
import { EventLogsService } from 'src/engine/core-modules/event-logs/event-logs.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

jest.mock('src/database/clickhouse/clickhouse.service', () => ({
  ClickHouseService: class {},
}));
jest.mock('src/engine/core-modules/billing/services/billing.service', () => ({
  BillingService: class {},
}));
jest.mock(
  'src/engine/core-modules/enterprise/services/enterprise-plan.service',
  () => ({ EnterprisePlanService: class {} }),
);
jest.mock(
  'src/engine/core-modules/user-workspace/user-workspace.entity',
  () => ({ UserWorkspaceEntity: class {} }),
);
jest.mock(
  'src/engine/core-modules/event-logs/application-monitoring/application-log-scope.service',
  () => ({ ApplicationLogScopeService: class {} }),
);

describe('event log monitoring queries', () => {
  const clickHouse = { getMainClient: jest.fn(() => ({})), select: jest.fn() };
  const scope = { resolve: jest.fn() };
  const service = new EventLogsService(
    clickHouse as unknown as ClickHouseService,
    {} as BillingService,
    {} as EnterprisePlanService,
    {} as Repository<UserWorkspaceEntity>,
    scope as unknown as ApplicationLogScopeService,
  );
  const workspace = { id: 'owner', eventLogRetentionDays: 7 };
  const start = new Date('2026-10-16T00:00:00Z');
  const end = new Date('2026-10-16T01:00:00Z');
  const input = {
    table: EventLogTable.APPLICATION_LOG,
    first: 1,
    includeActivity: true,
    instanceLevel: true,
    after: Buffer.from(String(end.getTime())).toString('base64'),
    filters: { dateRange: { start, end } },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    scope.resolve.mockResolvedValue({
      canQueryInstanceLevel: true,
      workspaces: [
        { id: 'customer', displayName: 'Customer', retentionStartDate: start },
      ],
      filters: input.filters,
    });
    clickHouse.select.mockImplementation(async (query: string) => {
      if (query.includes('GROUP BY bucket'))
        return [{ bucket: 2, info: 1000, warning: 5, error: 3 }];
      if (query.includes('count()')) return [{ totalCount: 1008 }];
      return [
        {
          timestamp: '2026-10-16 00:02:00.000',
          workspaceId: 'customer',
          applicationId: 'app',
          logicFunctionName: 'sync',
          level: 'INFO',
        },
      ];
    });
  });

  it('aggregates all matching events independently of the page and cursor', async () => {
    const result = await service.queryEventLogs(workspace, input);
    expect(result.records).toHaveLength(1);
    expect(result.activity).toHaveLength(48);
    expect(
      result.activity?.reduce(
        (total, bucket) => total + bucket.info + bucket.warning + bucket.error,
        0,
      ),
    ).toBe(1008);
    const [query, parameters] = clickHouse.select.mock.calls.find(([query]) =>
      query.includes('GROUP BY bucket'),
    )!;
    expect(query).not.toContain('cursorMs');
    expect(query).not.toContain('LIMIT');
    expect(parameters).toMatchObject({
      scopeWorkspaceIds: ['customer'],
      scopeRetentions: ['2026-10-16 00:00:00.000'],
      activityStart: start.getTime(),
      activityEnd: end.getTime(),
      bucketDuration: 75000,
    });
    expect(result.records[0].properties).toMatchObject({
      workspaceId: 'customer',
      workspaceName: 'Customer',
    });
  });

  it('uses the same workspace and retention restrictions for rows, totals, and activity', async () => {
    await service.queryEventLogs(workspace, input);
    for (const [query, parameters] of clickHouse.select.mock.calls) {
      expect(query).toContain(
        '"workspaceId" IN {scopeWorkspaceIds:Array(String)}',
      );
      expect(query).toContain('arrayExists');
      expect(parameters.scopeWorkspaceIds).toEqual(['customer']);
      expect(parameters.scopeRetentions).toEqual(['2026-10-16 00:00:00.000']);
    }
  });

  it('does not aggregate activity unless requested', async () => {
    const result = await service.queryEventLogs(workspace, {
      ...input,
      includeActivity: false,
    });
    expect(result.activity).toBeUndefined();
    expect(clickHouse.select).toHaveBeenCalledTimes(2);
  });

  it('authorizes before reading any rows or aggregates', async () => {
    scope.resolve.mockRejectedValue(new ForbiddenException());
    await expect(service.queryEventLogs(workspace, input)).rejects.toThrow(
      ForbiddenException,
    );
    expect(clickHouse.select).not.toHaveBeenCalled();
  });

  it('does not turn an unavailable activity query into zero counts', async () => {
    clickHouse.select.mockRejectedValue(new Error('unavailable'));
    await expect(service.queryEventLogs(workspace, input)).rejects.toThrow(
      'unavailable',
    );
  });
});
