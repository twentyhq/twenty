import type { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import {
  TriggerInstallApplicationJob,
  type TriggerInstallApplicationJobData,
} from 'src/engine/core-modules/application/application-install/jobs/trigger-install-application.job';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

describe('TriggerInstallApplicationJob', () => {
  const applicationInstallService = {
    installApplication: jest.fn(),
  } as unknown as ApplicationInstallService;

  const job = new TriggerInstallApplicationJob(applicationInstallService);

  const jobData: TriggerInstallApplicationJobData = {
    applicationRegistrationId: 'application-registration-id',
    workspaceId: 'workspace-id',
  };

  const jobContext: MessageQueueJobProgressContext = {
    updateProgress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('installs the requested application and forwards progress updates', async () => {
    await job.handle(jobData, jobContext);

    expect(applicationInstallService.installApplication).toHaveBeenCalledWith({
      appRegistrationId: jobData.applicationRegistrationId,
      workspaceId: jobData.workspaceId,
      hasUserApprovedCapabilities: true,
      updateProgress: jobContext.updateProgress,
    });
  });

  it('propagates installation failures to the queue', async () => {
    const error = new Error('Installation failed');

    jest
      .spyOn(applicationInstallService, 'installApplication')
      .mockRejectedValueOnce(error);

    await expect(job.handle(jobData, jobContext)).rejects.toThrow(error);
  });
});
