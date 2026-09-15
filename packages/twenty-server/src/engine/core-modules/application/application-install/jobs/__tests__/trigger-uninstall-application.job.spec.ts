import type { ApplicationUninstallRunnerService } from 'src/engine/core-modules/application/application-install/services/application-uninstall-runner.service';
import {
  TriggerUninstallApplicationJob,
  type TriggerUninstallApplicationJobData,
} from 'src/engine/core-modules/application/application-install/jobs/trigger-uninstall-application.job';

describe('TriggerUninstallApplicationJob', () => {
  const applicationUninstallRunnerService = {
    uninstallApplication: jest.fn(),
  } as unknown as ApplicationUninstallRunnerService;

  const job = new TriggerUninstallApplicationJob(
    applicationUninstallRunnerService,
  );

  const jobData: TriggerUninstallApplicationJobData = {
    universalIdentifier: 'application-universal-identifier',
    workspaceId: 'workspace-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uninstalls the requested application', async () => {
    await job.handle(jobData);

    expect(
      applicationUninstallRunnerService.uninstallApplication,
    ).toHaveBeenCalledWith(jobData);
  });

  it('propagates uninstallation failures to the queue', async () => {
    const error = new Error('Uninstallation failed');

    jest
      .spyOn(applicationUninstallRunnerService, 'uninstallApplication')
      .mockRejectedValueOnce(error);

    await expect(job.handle(jobData)).rejects.toThrow(error);
  });
});
