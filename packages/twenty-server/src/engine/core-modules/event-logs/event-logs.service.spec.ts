import { EventLogTable } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { type BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { EventLogsService } from 'src/engine/core-modules/event-logs/event-logs.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

const makeDeletedRecordRow = (recordId: string, timestamp: string) => ({
  event: 'Object Record Deleted',
  timestamp,
  workspaceId: 'workspace-id',
  recordId,
  objectMetadataId: 'company-object-metadata-id',
  properties: {},
});

describe('EventLogsService', () => {
  let service: EventLogsService;
  let select: jest.Mock;

  beforeEach(() => {
    select = jest.fn();

    service = new EventLogsService(
      { getMainClient: () => ({}), select } as unknown as ClickHouseService,
      { hasEntitlement: async () => true } as unknown as BillingService,
      { isValid: () => true } as unknown as EnterprisePlanService,
      {} as Repository<UserWorkspaceEntity>,
    );
  });

  it('returns every record sharing the timestamp of the last record of the page', async () => {
    select
      .mockResolvedValueOnce([
        makeDeletedRecordRow('company-1', '2026-09-24 11:42:31.100'),
        makeDeletedRecordRow('company-2', '2026-09-24 11:42:31.096'),
        makeDeletedRecordRow('company-3', '2026-09-24 11:42:31.096'),
      ])
      .mockResolvedValueOnce([{ totalCount: 5 }])
      .mockResolvedValueOnce([
        makeDeletedRecordRow('company-2', '2026-09-24 11:42:31.096'),
        makeDeletedRecordRow('company-3', '2026-09-24 11:42:31.096'),
        makeDeletedRecordRow('company-4', '2026-09-24 11:42:31.096'),
      ]);

    const result = await service.queryEventLogs('workspace-id', {
      table: EventLogTable.OBJECT_EVENT,
      first: 2,
    });

    expect(result.records.map((record) => record.recordId)).toEqual([
      'company-1',
      'company-2',
      'company-3',
      'company-4',
    ]);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it('keeps the page at the requested size when the next record is older', async () => {
    select
      .mockResolvedValueOnce([
        makeDeletedRecordRow('company-1', '2026-09-24 11:42:31.100'),
        makeDeletedRecordRow('company-2', '2026-09-24 11:42:31.096'),
        makeDeletedRecordRow('company-3', '2026-09-24 11:42:31.090'),
      ])
      .mockResolvedValueOnce([{ totalCount: 3 }]);

    const result = await service.queryEventLogs('workspace-id', {
      table: EventLogTable.OBJECT_EVENT,
      first: 2,
    });

    expect(result.records.map((record) => record.recordId)).toEqual([
      'company-1',
      'company-2',
    ]);
    expect(select).toHaveBeenCalledTimes(2);
  });
});
