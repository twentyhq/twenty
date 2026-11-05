import { Test } from '@nestjs/testing';

import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import {
  TriggerUpgradeApplicationJob,
  type TriggerUpgradeApplicationJobData,
} from 'src/engine/core-modules/application/application-upgrade/jobs/trigger-upgrade-application.job';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

describe('TriggerUpgradeApplicationJob', () => {
  const applicationUpgradeService = {
    upgradeApplication: jest.fn(),
  };

  let job: TriggerUpgradeApplicationJob;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TriggerUpgradeApplicationJob,
        {
          provide: ApplicationUpgradeService,
          useValue: applicationUpgradeService,
        },
      ],
    }).compile();

    job = module.get(TriggerUpgradeApplicationJob);
  });

  const jobData: TriggerUpgradeApplicationJobData = {
    applicationRegistrationId: 'application-registration-id',
    targetVersion: '2.0.0',
    workspaceId: 'workspace-id',
  };

  const jobContext: MessageQueueJobProgressContext = {
    jobId: 'job-id',
    updateProgress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('upgrades the requested application and forwards progress updates', async () => {
    await job.handle(jobData, jobContext);

    expect(applicationUpgradeService.upgradeApplication).toHaveBeenCalledTimes(
      1,
    );
    expect(applicationUpgradeService.upgradeApplication).toHaveBeenCalledWith({
      appRegistrationId: jobData.applicationRegistrationId,
      targetVersion: jobData.targetVersion,
      workspaceId: jobData.workspaceId,
      updateProgress: jobContext.updateProgress,
    });
  });

  it('propagates upgrade failures to the queue', async () => {
    const error = new Error('Upgrade failed');

    jest
      .spyOn(applicationUpgradeService, 'upgradeApplication')
      .mockRejectedValueOnce(error);

    await expect(job.handle(jobData, jobContext)).rejects.toThrow(error);
  });
});
