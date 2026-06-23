import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { ServerCronTriggerCronJob } from 'src/engine/core-modules/server-cron-trigger/server-cron-trigger.cron.job';

describe('ServerCronTriggerCronJob', () => {
  const buildJob = ({
    rows,
    featureEnabled = true,
  }: {
    rows: Array<Record<string, unknown>>;
    featureEnabled?: boolean;
  }) => {
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows),
    };
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const twentyConfigService = {
      get: jest.fn().mockReturnValue(featureEnabled),
    };

    const job = new ServerCronTriggerCronJob(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      repository as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messageQueueService as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      twentyConfigService as any,
    );

    return { job, messageQueueService, queryBuilder, twentyConfigService };
  };

  it('enqueues a due cron with a valid pattern and owner', async () => {
    const { job, messageQueueService } = buildJob({
      rows: [
        {
          id: 'lf-1',
          workspaceId: 'ws-1',
          serverCronTriggerSettings: { pattern: '* * * * *' },
        },
      ],
    });

    await job.handle();

    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      [
        {
          logicFunctionId: 'lf-1',
          workspaceId: 'ws-1',
          payload: { source: 'server-cron' },
        },
      ],
      { retryLimit: 3 },
    );
  });

  it('returns early when the feature is disabled', async () => {
    const { job, messageQueueService, queryBuilder } = buildJob({
      rows: [],
      featureEnabled: false,
    });

    await job.handle();

    expect(queryBuilder.getMany).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('skips rows whose cron pattern does not match the current minute', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-23T10:30:00.000Z'));

    const { job, messageQueueService } = buildJob({
      rows: [
        {
          id: 'lf-2',
          workspaceId: 'ws-1',
          // 0 0 * * 0 = midnight on Sundays — does not match the clock above
          serverCronTriggerSettings: { pattern: '0 0 * * 0' },
        },
      ],
    });

    await job.handle();

    expect(messageQueueService.add).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('filters by server-cron + owner-workspace + alive predicates at the SQL layer', async () => {
    const { job, queryBuilder } = buildJob({ rows: [] });

    await job.handle();

    const whereCalls = [
      ...queryBuilder.where.mock.calls,
      ...queryBuilder.andWhere.mock.calls,
    ].flat();

    expect(whereCalls).toEqual(
      expect.arrayContaining([
        expect.stringContaining('lf."serverCronTriggerSettings" IS NOT NULL'),
        expect.stringContaining('lf."deletedAt" IS NULL'),
        expect.stringContaining('lf."workspaceId" = reg."workspaceId"'),
        expect.stringContaining('reg."deletedAt" IS NULL'),
        expect.stringContaining('reg."workspaceId" IS NOT NULL'),
      ]),
    );
  });
});
