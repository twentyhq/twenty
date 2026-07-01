import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { InstallOnboardingAppsJob } from 'src/engine/core-modules/onboarding/jobs/install-onboarding-apps.job';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';

describe('InstallOnboardingAppsJob', () => {
  let job: InstallOnboardingAppsJob;
  let applicationRegistrationService: ApplicationRegistrationService;
  let applicationInstallService: ApplicationInstallService;
  let onboardingService: OnboardingService;

  const workspaceId = 'workspace-id';
  const callRecorderId = 'call-recorder-uid';
  const peopleDataLabsId = 'people-data-labs-uid';

  const buildRegistration = (id: string) =>
    ({ id }) as ApplicationRegistrationEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstallOnboardingAppsJob,
        {
          provide: ApplicationRegistrationService,
          useValue: {
            findOneByUniversalIdentifier: jest.fn(),
          },
        },
        {
          provide: ApplicationInstallService,
          useValue: {
            installApplication: jest.fn(),
          },
        },
        {
          provide: OnboardingService,
          useValue: {
            creditInstallAppsReward: jest.fn(),
          },
        },
      ],
    }).compile();

    job = module.get<InstallOnboardingAppsJob>(InstallOnboardingAppsJob);
    applicationRegistrationService = module.get<ApplicationRegistrationService>(
      ApplicationRegistrationService,
    );
    applicationInstallService = module.get<ApplicationInstallService>(
      ApplicationInstallService,
    );
    onboardingService = module.get<OnboardingService>(OnboardingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should credit the reward for every requested app and install them', async () => {
    jest
      .spyOn(applicationRegistrationService, 'findOneByUniversalIdentifier')
      .mockImplementation(async (universalIdentifier) =>
        buildRegistration(`registration-${universalIdentifier}`),
      );
    jest
      .spyOn(applicationInstallService, 'installApplication')
      .mockResolvedValue(true);

    await job.handle({
      workspaceId,
      universalIdentifiers: [callRecorderId, peopleDataLabsId],
    });

    expect(onboardingService.creditInstallAppsReward).toHaveBeenCalledWith({
      workspaceId,
      rewardAppsCount: 2,
    });
    expect(applicationInstallService.installApplication).toHaveBeenCalledTimes(
      2,
    );
  });

  it('should credit before attempting the installs', async () => {
    jest
      .spyOn(applicationRegistrationService, 'findOneByUniversalIdentifier')
      .mockImplementation(async (universalIdentifier) =>
        buildRegistration(`registration-${universalIdentifier}`),
      );
    jest
      .spyOn(applicationInstallService, 'installApplication')
      .mockResolvedValue(true);

    await job.handle({
      workspaceId,
      universalIdentifiers: [callRecorderId],
    });

    const creditOrder = (onboardingService.creditInstallAppsReward as jest.Mock)
      .mock.invocationCallOrder[0];
    const installOrder = (
      applicationInstallService.installApplication as jest.Mock
    ).mock.invocationCallOrder[0];

    expect(creditOrder).toBeLessThan(installOrder);
  });

  it('should credit even when an install fails', async () => {
    jest
      .spyOn(applicationRegistrationService, 'findOneByUniversalIdentifier')
      .mockImplementation(async (universalIdentifier) =>
        buildRegistration(`registration-${universalIdentifier}`),
      );
    jest
      .spyOn(applicationInstallService, 'installApplication')
      .mockRejectedValue(new Error('install failure'));

    await job.handle({
      workspaceId,
      universalIdentifiers: [callRecorderId, peopleDataLabsId],
    });

    expect(onboardingService.creditInstallAppsReward).toHaveBeenCalledWith({
      workspaceId,
      rewardAppsCount: 2,
    });
    expect(applicationInstallService.installApplication).toHaveBeenCalledTimes(
      2,
    );
  });

  it('should skip installing apps whose registration cannot be found but still credit the full count', async () => {
    jest
      .spyOn(applicationRegistrationService, 'findOneByUniversalIdentifier')
      .mockImplementation(async (universalIdentifier) =>
        universalIdentifier === callRecorderId
          ? null
          : buildRegistration(`registration-${universalIdentifier}`),
      );
    jest
      .spyOn(applicationInstallService, 'installApplication')
      .mockResolvedValue(true);

    await job.handle({
      workspaceId,
      universalIdentifiers: [callRecorderId, peopleDataLabsId],
    });

    expect(onboardingService.creditInstallAppsReward).toHaveBeenCalledWith({
      workspaceId,
      rewardAppsCount: 2,
    });
    expect(applicationInstallService.installApplication).toHaveBeenCalledTimes(
      1,
    );
  });
});
