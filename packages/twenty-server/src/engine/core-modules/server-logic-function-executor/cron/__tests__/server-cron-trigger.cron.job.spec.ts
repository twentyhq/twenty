import { ServerCronTriggerCronJob } from 'src/engine/core-modules/server-logic-function-executor/cron/server-cron-trigger.cron.job';
import { ServerLogicFunctionExecutionJob } from 'src/engine/core-modules/server-logic-function-executor/cron/server-logic-function-execution.job';

describe('ServerCronTriggerCronJob', () => {
  const buildJob = ({ rows }: { rows: Array<Record<string, unknown>> }) => {
    const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
    const queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows),
    };
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const job = new ServerCronTriggerCronJob(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      repository as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messageQueueService as any,
    );

    return { job, messageQueueService, queryBuilder };
  };

  it('enqueues a due cron with a valid pattern and owner', async () => {
    const { job, messageQueueService } = buildJob({
      rows: [
        {
          id: 'srv-1',
          universalIdentifier: 'fn-uid',
          disabledAt: null,
          serverCronTriggerSettings: { pattern: '* * * * *' },
          applicationRegistration: {
            universalIdentifier: 'reg-uid',
            ownerWorkspaceId: 'ws-1',
          },
        },
      ],
    });

    await job.handle();

    expect(messageQueueService.add).toHaveBeenCalledWith(
      ServerLogicFunctionExecutionJob.name,
      {
        applicationRegistrationUniversalIdentifier: 'reg-uid',
        logicFunctionUniversalIdentifier: 'fn-uid',
      },
      { retryLimit: 3 },
    );
  });

  it('skips rows whose owner workspace is null', async () => {
    const { job, messageQueueService } = buildJob({
      rows: [
        {
          id: 'srv-2',
          universalIdentifier: 'fn-uid',
          disabledAt: null,
          serverCronTriggerSettings: { pattern: '* * * * *' },
          applicationRegistration: {
            universalIdentifier: 'reg-uid',
            ownerWorkspaceId: null,
          },
        },
      ],
    });

    await job.handle();

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('skips rows whose cron pattern does not match the current minute', async () => {
    // 0 0 * * 0 = midnight on Sundays; using a non-Sunday non-midnight clock
    // guarantees shouldRunNow returns false.
    jest.useFakeTimers().setSystemTime(new Date('2026-06-23T10:30:00.000Z'));

    const { job, messageQueueService } = buildJob({
      rows: [
        {
          id: 'srv-3',
          universalIdentifier: 'fn-uid',
          disabledAt: null,
          serverCronTriggerSettings: { pattern: '0 0 * * 0' },
          applicationRegistration: {
            universalIdentifier: 'reg-uid',
            ownerWorkspaceId: 'ws-1',
          },
        },
      ],
    });

    await job.handle();

    expect(messageQueueService.add).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('filters disabledAt and deletedAt at the SQL layer', async () => {
    const { job, queryBuilder } = buildJob({ rows: [] });

    await job.handle();

    const whereCalls = [
      ...queryBuilder.where.mock.calls,
      ...queryBuilder.andWhere.mock.calls,
    ].flat();

    expect(whereCalls).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'serverLogicFunction."serverCronTriggerSettings" IS NOT NULL',
        ),
        expect.stringContaining('serverLogicFunction."disabledAt" IS NULL'),
        expect.stringContaining('serverLogicFunction."deletedAt" IS NULL'),
        expect.stringContaining(
          'applicationRegistration."workspaceId" IS NOT NULL',
        ),
        expect.stringContaining('applicationRegistration."deletedAt" IS NULL'),
      ]),
    );
  });
});
