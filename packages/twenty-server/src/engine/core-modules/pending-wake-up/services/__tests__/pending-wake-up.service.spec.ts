import { RESUME_PENDING_WAKE_UP_JOB_NAME } from 'src/engine/core-modules/pending-wake-up/constants/resume-pending-wake-up-job-name.constant';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';

const WORKSPACE_ID = 'workspace-id';
const OWNER = { type: 'WORKFLOW_STEP' as const, id: 'run-id', key: 'step-id' };
const OWNER_JOB_OPTIONS = { id: 'run-id', allowDuplicatedPrefixes: true };

const buildService = () => {
  const pendingWakeUpRepository = {
    upsert: jest.fn(),
    delete: jest.fn(),
  };
  const messageQueueService = { add: jest.fn() };
  const registry = new PendingWakeUpOwnerHandlerRegistryService();

  registry.register({
    ownerType: 'WORKFLOW_STEP',
    buildResumeJobOptions: jest.fn().mockReturnValue(OWNER_JOB_OPTIONS),
    beforeClaim: jest.fn(),
    resolve: jest.fn(),
  });

  const service = new PendingWakeUpService(
    pendingWakeUpRepository as never,
    messageQueueService as never,
    registry,
  );

  return { service, pendingWakeUpRepository, messageQueueService };
};

describe('PendingWakeUpService', () => {
  it('stores an event wake-up without scheduling it when it never expires', async () => {
    const { service, pendingWakeUpRepository, messageQueueService } =
      buildService();

    await service.arm({
      workspaceId: WORKSPACE_ID,
      owner: OWNER,
      condition: { type: 'EVENT', eventName: 'company.updated' },
    });

    expect(pendingWakeUpRepository.upsert).toHaveBeenCalledWith(
      WORKSPACE_ID,
      expect.objectContaining({
        ownerType: 'WORKFLOW_STEP',
        ownerId: 'run-id',
        ownerKey: 'step-id',
        eventName: 'company.updated',
        resumeAt: null,
      }),
      ['ownerType', 'ownerId', 'ownerKey'],
    );
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('schedules a time wake-up with the job options of its owner', async () => {
    const { service, pendingWakeUpRepository, messageQueueService } =
      buildService();
    const resumeAt = new Date(Date.now() + 60_000).toISOString();

    await service.arm({
      workspaceId: WORKSPACE_ID,
      owner: OWNER,
      condition: { type: 'TIME', resumeAt },
    });

    const [, storedWakeUp] = pendingWakeUpRepository.upsert.mock.calls[0];

    expect(storedWakeUp).toMatchObject({
      eventName: null,
      resumeAt: new Date(resumeAt),
    });
    expect(messageQueueService.add).toHaveBeenCalledWith(
      RESUME_PENDING_WAKE_UP_JOB_NAME,
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        wakeUpId: storedWakeUp.id,
      }),
      expect.objectContaining({
        ...OWNER_JOB_OPTIONS,
        delay: expect.any(Number),
      }),
    );
  });

  it('cancels one wake-up of an owner by its key', async () => {
    const { service, pendingWakeUpRepository } = buildService();

    await service.cancel({ workspaceId: WORKSPACE_ID, owner: OWNER });

    expect(pendingWakeUpRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      ownerType: 'WORKFLOW_STEP',
      ownerId: 'run-id',
      ownerKey: 'step-id',
    });
  });

  it('cancels every wake-up of an owner', async () => {
    const { service, pendingWakeUpRepository } = buildService();

    await service.cancelAllForOwner({
      workspaceId: WORKSPACE_ID,
      ownerType: 'WORKFLOW_STEP',
      ownerId: 'run-id',
    });

    expect(pendingWakeUpRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
      ownerType: 'WORKFLOW_STEP',
      ownerId: 'run-id',
    });
  });
});
