import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { PreInstalledAppsService } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

describe('PreInstalledAppsService', () => {
  let service: PreInstalledAppsService;
  let applicationInstallService: { installApplication: jest.Mock };
  let applicationRegistrationRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
  };
  let workspaceIteratorService: { iterate: jest.Mock };

  beforeEach(async () => {
    applicationInstallService = { installApplication: jest.fn() };
    applicationRegistrationRepository = { find: jest.fn(), findOne: jest.fn() };
    workspaceIteratorService = { iterate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreInstalledAppsService,
        {
          provide: ApplicationInstallService,
          useValue: applicationInstallService,
        },
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: WorkspaceIteratorService,
          useValue: workspaceIteratorService,
        },
      ],
    }).compile();

    service = module.get<PreInstalledAppsService>(PreInstalledAppsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('backfillApplicationOnAllWorkspaces', () => {
    it('should throw when the registration does not exist', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.backfillApplicationOnAllWorkspaces('missing-id'),
      ).rejects.toThrow(ApplicationException);

      expect(workspaceIteratorService.iterate).not.toHaveBeenCalled();
    });

    it('should install the app on every iterated workspace', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue({
        id: 'app-1',
        name: 'My App',
      } as ApplicationRegistrationEntity);

      workspaceIteratorService.iterate.mockImplementation(
        async ({ callback }) => {
          await callback({ workspaceId: 'workspace-1', index: 0, total: 2 });
          await callback({ workspaceId: 'workspace-2', index: 1, total: 2 });

          return { success: [{ workspaceId: 'workspace-1' }], fail: [] };
        },
      );

      await service.backfillApplicationOnAllWorkspaces('app-1');

      expect(
        applicationInstallService.installApplication,
      ).toHaveBeenCalledTimes(2);
      expect(applicationInstallService.installApplication).toHaveBeenCalledWith(
        {
          appRegistrationId: 'app-1',
          workspaceId: 'workspace-1',
        },
      );
      expect(applicationInstallService.installApplication).toHaveBeenCalledWith(
        {
          appRegistrationId: 'app-1',
          workspaceId: 'workspace-2',
        },
      );
    });

    it('should swallow already-installed errors so the backfill stays idempotent', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue({
        id: 'app-1',
        name: 'My App',
      } as ApplicationRegistrationEntity);

      applicationInstallService.installApplication.mockRejectedValue(
        new ApplicationException(
          'already installed',
          ApplicationExceptionCode.APP_ALREADY_INSTALLED,
        ),
      );

      workspaceIteratorService.iterate.mockImplementation(
        async ({ callback }) => {
          await expect(
            callback({ workspaceId: 'workspace-1', index: 0, total: 1 }),
          ).resolves.toBeUndefined();

          return { success: [{ workspaceId: 'workspace-1' }], fail: [] };
        },
      );

      await expect(
        service.backfillApplicationOnAllWorkspaces('app-1'),
      ).resolves.toBeUndefined();
    });

    it('should rethrow unexpected install errors to the iterator', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue({
        id: 'app-1',
        name: 'My App',
      } as ApplicationRegistrationEntity);

      const unexpectedError = new Error('boom');

      applicationInstallService.installApplication.mockRejectedValue(
        unexpectedError,
      );

      workspaceIteratorService.iterate.mockImplementation(
        async ({ callback }) => {
          await expect(
            callback({ workspaceId: 'workspace-1', index: 0, total: 1 }),
          ).rejects.toThrow(unexpectedError);

          return {
            success: [],
            fail: [{ workspaceId: 'workspace-1', error: unexpectedError }],
          };
        },
      );

      await expect(
        service.backfillApplicationOnAllWorkspaces('app-1'),
      ).resolves.toBeUndefined();
    });
  });
});
