import type { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import {
  TriggerInstallApplicationJob,
  type TriggerInstallApplicationJobData,
} from 'src/engine/core-modules/application/application-install/jobs/trigger-install-application.job';

describe('TriggerInstallApplicationJob', () => {
  const applicationInstallService = {
    installApplication: jest.fn(),
  } as unknown as ApplicationInstallService;

  const job = new TriggerInstallApplicationJob(applicationInstallService);

  const jobData: TriggerInstallApplicationJobData = {
    applicationRegistrationId: 'application-registration-id',
    workspaceId: 'workspace-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('installs the requested application', async () => {
    await job.handle(jobData);

    expect(applicationInstallService.installApplication).toHaveBeenCalledWith({
      appRegistrationId: jobData.applicationRegistrationId,
      workspaceId: jobData.workspaceId,
    });
  });

  it('propagates installation failures to the queue', async () => {
    const error = new Error('Installation failed');

    jest
      .spyOn(applicationInstallService, 'installApplication')
      .mockRejectedValueOnce(error);

    await expect(job.handle(jobData)).rejects.toThrow(error);
  });
});
