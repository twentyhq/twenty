import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationException } from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const APPLICATION_ID = 'application-1';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier-1';
const APPLICATION_REGISTRATION_ID = 'application-registration-1';
const APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER =
  'application-registration-universal-identifier-1';
const WORKSPACE_ID = 'workspace-1';

describe('ApplicationStopService', () => {
  let applicationStopService: ApplicationStopService;

  const applicationRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  const applicationRegistrationRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  const workspaceCacheService = {
    invalidateAndRecompute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationStopService,
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: applicationRepository,
        },
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: WorkspaceCacheService,
          useValue: workspaceCacheService,
        },
      ],
    }).compile();

    applicationStopService = module.get<ApplicationStopService>(
      ApplicationStopService,
    );
  });

  describe('stopApplication', () => {
    it('should set stoppedAt and invalidate the workspace application cache', async () => {
      applicationRepository.findOne.mockResolvedValue({
        id: APPLICATION_ID,
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
        stoppedAt: null,
      });

      const application = await applicationStopService.stopApplication({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(applicationRepository.update).toHaveBeenCalledWith(
        APPLICATION_ID,
        { stoppedAt: expect.any(Date) },
      );
      expect(workspaceCacheService.invalidateAndRecompute).toHaveBeenCalledWith(
        WORKSPACE_ID,
        ['flatApplicationMaps'],
      );
      expect(application.stoppedAt).toBeInstanceOf(Date);
    });

    it('should throw when the application does not exist', async () => {
      applicationRepository.findOne.mockResolvedValue(null);

      await expect(
        applicationStopService.stopApplication({
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).rejects.toThrow(ApplicationException);

      expect(applicationRepository.update).not.toHaveBeenCalled();
      expect(
        workspaceCacheService.invalidateAndRecompute,
      ).not.toHaveBeenCalled();
    });
  });

  describe('startApplication', () => {
    it('should clear stoppedAt and invalidate the workspace application cache', async () => {
      applicationRepository.findOne.mockResolvedValue({
        id: APPLICATION_ID,
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
        stoppedAt: new Date(),
      });

      const application = await applicationStopService.startApplication({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(applicationRepository.update).toHaveBeenCalledWith(
        APPLICATION_ID,
        { stoppedAt: null },
      );
      expect(workspaceCacheService.invalidateAndRecompute).toHaveBeenCalledWith(
        WORKSPACE_ID,
        ['flatApplicationMaps'],
      );
      expect(application.stoppedAt).toBeNull();
    });

    it('should throw when the application does not exist', async () => {
      applicationRepository.findOne.mockResolvedValue(null);

      await expect(
        applicationStopService.startApplication({
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ).rejects.toThrow(ApplicationException);

      expect(applicationRepository.update).not.toHaveBeenCalled();
      expect(
        workspaceCacheService.invalidateAndRecompute,
      ).not.toHaveBeenCalled();
    });
  });

  describe('stopApplicationRegistration', () => {
    it('should set stoppedAt on the registration and report the installed application count', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue({
        id: APPLICATION_REGISTRATION_ID,
        universalIdentifier: APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER,
        name: 'My App',
        stoppedAt: null,
      });
      applicationRepository.count.mockResolvedValue(3);

      const { applicationRegistration, installedApplicationCount } =
        await applicationStopService.stopApplicationRegistration({
          applicationRegistrationUniversalIdentifier:
            APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER,
        });

      expect(applicationRegistrationRepository.update).toHaveBeenCalledWith(
        APPLICATION_REGISTRATION_ID,
        { stoppedAt: expect.any(Date) },
      );
      expect(applicationRegistration.stoppedAt).toBeInstanceOf(Date);
      expect(installedApplicationCount).toBe(3);
    });

    it('should throw when the registration does not exist', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue(null);

      await expect(
        applicationStopService.stopApplicationRegistration({
          applicationRegistrationUniversalIdentifier:
            APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER,
        }),
      ).rejects.toThrow(ApplicationRegistrationException);

      expect(applicationRegistrationRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('startApplicationRegistration', () => {
    it('should clear stoppedAt on the registration', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue({
        id: APPLICATION_REGISTRATION_ID,
        universalIdentifier: APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER,
        name: 'My App',
        stoppedAt: new Date(),
      });
      applicationRepository.count.mockResolvedValue(1);

      const { applicationRegistration } =
        await applicationStopService.startApplicationRegistration({
          applicationRegistrationUniversalIdentifier:
            APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER,
        });

      expect(applicationRegistrationRepository.update).toHaveBeenCalledWith(
        APPLICATION_REGISTRATION_ID,
        { stoppedAt: null },
      );
      expect(applicationRegistration.stoppedAt).toBeNull();
    });

    it('should throw when the registration does not exist', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue(null);

      await expect(
        applicationStopService.startApplicationRegistration({
          applicationRegistrationUniversalIdentifier:
            APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER,
        }),
      ).rejects.toThrow(ApplicationRegistrationException);

      expect(applicationRegistrationRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('isApplicationRegistrationStopped', () => {
    it('should return true when a stopped registration matches', async () => {
      applicationRegistrationRepository.count.mockResolvedValue(1);

      await expect(
        applicationStopService.isApplicationRegistrationStopped(
          APPLICATION_REGISTRATION_ID,
        ),
      ).resolves.toBe(true);
    });

    it('should return false when the registration is not stopped', async () => {
      applicationRegistrationRepository.count.mockResolvedValue(0);

      await expect(
        applicationStopService.isApplicationRegistrationStopped(
          APPLICATION_REGISTRATION_ID,
        ),
      ).resolves.toBe(false);
    });
  });
});
