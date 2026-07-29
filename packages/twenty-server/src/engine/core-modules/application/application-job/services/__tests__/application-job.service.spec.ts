import { type Repository } from 'typeorm';

import { type EnqueueJobInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job.input';
import { ApplicationJobService } from 'src/engine/core-modules/application/application-job/services/application-job.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const APPLICATION_ID = 'c2a9e9d0-1f42-4f0e-9a0e-6d2e4b2a1f01';
const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const TARGET_UNIVERSAL_IDENTIFIER = '5a2f4d2a-1a1e-4c66-8a54-1f0a2b3c4d5e';
const TARGET_LOGIC_FUNCTION_ID = 'ab6a2e5c-8c1f-4d0a-9bd1-52c1f5a9e100';

describe('ApplicationJobService', () => {
  let service: ApplicationJobService;
  let logicFunctionRepository: { findOne: jest.Mock };
  let messageQueueService: jest.Mocked<Pick<MessageQueueService, 'add'>>;

  const enqueueJob = (
    input: EnqueueJobInputDTO,
    overrides: { userId?: string | null; userWorkspaceId?: string | null } = {},
  ) =>
    service.enqueueJob({
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      userId: overrides.userId ?? null,
      userWorkspaceId: overrides.userWorkspaceId ?? null,
      input,
    });

  beforeEach(() => {
    jest.clearAllMocks();

    logicFunctionRepository = {
      findOne: jest.fn().mockResolvedValue({ id: TARGET_LOGIC_FUNCTION_ID }),
    };
    messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };

    service = new ApplicationJobService(
      logicFunctionRepository as unknown as Repository<LogicFunctionEntity>,
      messageQueueService as unknown as MessageQueueService,
    );
  });

  it('should enqueue a logic function trigger job with the provided job options', async () => {
    const result = await enqueueJob({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      payload: { batchIndex: 2 },
      retryLimit: 3,
      priority: 5,
      delayMs: 1000,
    });

    expect(result).toEqual({
      enqueued: true,
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      {
        logicFunctionId: TARGET_LOGIC_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
        payload: { batchIndex: 2 },
      },
      { retryLimit: 3, priority: 5, delay: 1000 },
    );
  });

  it('should default to no retry and omit unset queue options', async () => {
    await enqueueJob({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      {
        logicFunctionId: TARGET_LOGIC_FUNCTION_ID,
        workspaceId: WORKSPACE_ID,
        payload: {},
      },
      { retryLimit: 0 },
    );
  });

  it('should forward the acting user so the queued run keeps the caller permissions', async () => {
    await enqueueJob(
      { logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER },
      { userId: 'user-1', userWorkspaceId: 'user-workspace-1' },
    );

    expect(messageQueueService.add).toHaveBeenCalledWith(
      LogicFunctionTriggerJob.name,
      expect.objectContaining({
        userId: 'user-1',
        userWorkspaceId: 'user-workspace-1',
      }),
      expect.anything(),
    );
  });

  it('should only look up logic functions owned by the calling application', async () => {
    await enqueueJob({
      logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
    });

    expect(logicFunctionRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          universalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
          applicationId: APPLICATION_ID,
        },
      }),
    );
  });

  it('should throw LOGIC_FUNCTION_NOT_FOUND when the function does not belong to the application', async () => {
    logicFunctionRepository.findOne.mockResolvedValue(null);

    await expect(
      enqueueJob({
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      }),
    ).rejects.toThrow(ApplicationException);

    await expect(
      enqueueJob({
        logicFunctionUniversalIdentifier: TARGET_UNIVERSAL_IDENTIFIER,
      }),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
