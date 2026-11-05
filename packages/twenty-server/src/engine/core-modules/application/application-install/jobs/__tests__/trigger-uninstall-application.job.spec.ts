import { Test } from '@nestjs/testing';

import { ApplicationUninstallRunnerService } from 'src/engine/core-modules/application/application-install/services/application-uninstall-runner.service';
import {
  TriggerUninstallApplicationJob,
  type TriggerUninstallApplicationJobData,
} from 'src/engine/core-modules/application/application-install/jobs/trigger-uninstall-application.job';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

describe('TriggerUninstallApplicationJob', () => {
  const applicationUninstallRunnerService = {
    uninstallApplication: jest.fn(),
  };

  let job: TriggerUninstallApplicationJob;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TriggerUninstallApplicationJob,
        {
          provide: ApplicationUninstallRunnerService,
          useValue: applicationUninstallRunnerService,
        },
      ],
    }).compile();

    job = module.get(TriggerUninstallApplicationJob);
  });

  const jobData: TriggerUninstallApplicationJobData = {
    universalIdentifier: 'application-universal-identifier',
    workspaceId: 'workspace-id',
  };

  const jobContext: MessageQueueJobProgressContext = {
    jobId: 'job-id',
    updateProgress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uninstalls the requested application and forwards progress updates', async () => {
    await job.handle(jobData, jobContext);

    expect(
      applicationUninstallRunnerService.uninstallApplication,
    ).toHaveBeenCalledWith({
      ...jobData,
      updateProgress: jobContext.updateProgress,
    });
  });

  it('propagates uninstallation failures to the queue', async () => {
    const error = new Error('Uninstallation failed');

    jest
      .spyOn(applicationUninstallRunnerService, 'uninstallApplication')
      .mockRejectedValueOnce(error);

    await expect(job.handle(jobData, jobContext)).rejects.toThrow(error);
  });
});
