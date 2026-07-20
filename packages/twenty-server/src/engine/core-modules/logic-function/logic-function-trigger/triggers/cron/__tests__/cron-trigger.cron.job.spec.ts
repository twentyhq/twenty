import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { CronTriggerCronJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/cron/cron-trigger.cron.job';

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job',
  () => ({ LogicFunctionTriggerJob: class LogicFunctionTriggerJob {} }),
);

const WORKSPACE_ID = 'workspace-id';
const LOGIC_FUNCTION_ID = 'logic-function-id';
const CALL_RECORDER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '8da4b8b5-5edf-4880-b51f-ab6e679ec617';
const LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  'd7d1170f-abb1-4c9b-8258-13219a611b03';

describe('CronTriggerCronJob', () => {
  const messageQueueService = { add: jest.fn() };
  const workspaceRepository = { find: jest.fn() };
  const workspaceCacheService = { getOrRecompute: jest.fn() };
  const exceptionHandlerService = { captureExceptions: jest.fn() };
  const cronTriggerDeduplicationService = { shouldDispatch: jest.fn() };

  const job = new CronTriggerCronJob(
    messageQueueService as never,
    workspaceRepository as never,
    workspaceCacheService as never,
    exceptionHandlerService as never,
    cronTriggerDeduplicationService as never,
  );

  const setLogicFunction = ({
    applicationUniversalIdentifier = CALL_RECORDER_APPLICATION_UNIVERSAL_IDENTIFIER,
    cronPattern = '*/15 * * * *',
  }: {
    applicationUniversalIdentifier?: string;
    cronPattern?: string;
  } = {}) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatLogicFunctionMaps: {
        byUniversalIdentifier: {
          [LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER]: {
            id: LOGIC_FUNCTION_ID,
            universalIdentifier: LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
            applicationUniversalIdentifier,
            deletedAt: null,
            cronTriggerSettings: { pattern: cronPattern },
          },
        },
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    workspaceRepository.find.mockResolvedValue([{ id: WORKSPACE_ID }]);
    cronTriggerDeduplicationService.shouldDispatch.mockResolvedValue(true);
  });

  it('spreads an installed Call Recorder cron by workspace', async () => {
    setLogicFunction();

    await job.handle();

    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      [
        {
          logicFunctionId: LOGIC_FUNCTION_ID,
          workspaceId: WORKSPACE_ID,
          payload: {},
        },
      ],
      { retryLimit: 3, delay: 49_026 },
    );
  });

  it('dispatches unrelated cron triggers without delay', async () => {
    setLogicFunction({
      applicationUniversalIdentifier: 'another-application',
    });

    await job.handle();

    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      [
        {
          logicFunctionId: LOGIC_FUNCTION_ID,
          workspaceId: WORKSPACE_ID,
          payload: {},
        },
      ],
      { retryLimit: 3 },
    );
  });
});
