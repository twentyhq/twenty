import { CronTriggerCronJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/cron/cron-trigger.cron.job';
import { computeCronTriggerSpreadOffsetMs } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/compute-cron-trigger-spread-offset-ms.util';

const WORKSPACE_ID = 'workspace-id';
const LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  'b6f9a5b4-1d4e-4a4b-9c55-6c1f0b2a7e11';
const NOW_MS = Date.UTC(2026, 0, 1, 12, 0, 3);

const buildJob = (cronTriggerSettings: {
  pattern: string;
  spreadMs?: number;
}) => {
  const shouldDispatch = jest.fn().mockResolvedValue(false);
  const job = new CronTriggerCronJob(
    {} as never,
    { find: jest.fn().mockResolvedValue([{ id: WORKSPACE_ID }]) } as never,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatLogicFunctionMaps: {
          byUniversalIdentifier: {
            [LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER]: {
              id: 'logic-function-id',
              universalIdentifier: LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
              cronTriggerSettings,
              deletedAt: null,
            },
          },
        },
        flatApplicationMaps: {},
      }),
    } as never,
    { captureExceptions: jest.fn() } as never,
    { shouldDispatch } as never,
    {} as never,
    {} as never,
  );

  return { job, shouldDispatch };
};

describe('CronTriggerCronJob', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW_MS });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('evaluates a cron without spreadMs at the current time', async () => {
    const { job, shouldDispatch } = buildJob({ pattern: '0 * * * *' });

    await job.handle();

    expect(shouldDispatch).toHaveBeenCalledWith(
      `logic-function-cron:${WORKSPACE_ID}:logic-function-id`,
      '0 * * * *',
      new Date(NOW_MS),
    );
  });

  it('evaluates a spread cron at the current time minus its offset', async () => {
    const spreadMs = 60 * 60_000;
    const { job, shouldDispatch } = buildJob({
      pattern: '0 * * * *',
      spreadMs,
    });

    await job.handle();

    expect(shouldDispatch).toHaveBeenCalledWith(
      `logic-function-cron:${WORKSPACE_ID}:logic-function-id`,
      '0 * * * *',
      new Date(
        NOW_MS -
          computeCronTriggerSpreadOffsetMs({
            workspaceId: WORKSPACE_ID,
            logicFunctionUniversalIdentifier:
              LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
            spreadMs,
          }),
      ),
    );
  });
});
