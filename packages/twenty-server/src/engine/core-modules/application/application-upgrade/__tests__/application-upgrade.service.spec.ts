import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';

const APPLICATION_REGISTRATION_ID = '20202020-0000-0000-0000-000000000001';
const PROVISIONED_WORKSPACE_ID = '20202020-0000-0000-0000-000000000002';
const UNPROVISIONED_WORKSPACE_ID = '20202020-0000-0000-0000-000000000003';

describe('ApplicationUpgradeService', () => {
  let service: ApplicationUpgradeService;

  const appRegistrationRepository = { findOneOrFail: jest.fn() };
  const applicationRepository = { find: jest.fn() };
  const workspaceRepository = { find: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationUpgradeService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: appRegistrationRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: applicationRepository,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: workspaceRepository,
        },
        { provide: ApplicationInstallService, useValue: {} },
        { provide: ApplicationRegistrationService, useValue: {} },
        { provide: TwentyConfigService, useValue: { get: jest.fn() } },
        { provide: WorkspaceIteratorService, useValue: { iterate: jest.fn() } },
      ],
    }).compile();

    service = module.get(ApplicationUpgradeService);
  });

  describe('findApplicationsToUpgrade', () => {
    beforeEach(() => {
      appRegistrationRepository.findOneOrFail.mockResolvedValue({
        id: APPLICATION_REGISTRATION_ID,
        latestAvailableVersion: '2.0.0',
      });
      applicationRepository.find.mockResolvedValue([
        {
          id: 'app-1',
          workspaceId: PROVISIONED_WORKSPACE_ID,
          version: '1.0.0',
        },
        {
          id: 'app-2',
          workspaceId: UNPROVISIONED_WORKSPACE_ID,
          version: '1.0.0',
        },
      ]);
      workspaceRepository.find.mockResolvedValue([
        { id: PROVISIONED_WORKSPACE_ID },
      ]);
    });

    it('excludes applications installed on non provisioned workspaces', async () => {
      const { applicationsToUpgrade } = await service.findApplicationsToUpgrade(
        {
          applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        },
      );

      expect(applicationsToUpgrade.map(({ id }) => id)).toEqual(['app-1']);
    });

    it('applies the workspace count limit after the provisioned filter', async () => {
      applicationRepository.find.mockResolvedValue([
        {
          id: 'app-2',
          workspaceId: UNPROVISIONED_WORKSPACE_ID,
          version: '1.0.0',
        },
        {
          id: 'app-1',
          workspaceId: PROVISIONED_WORKSPACE_ID,
          version: '1.0.0',
        },
      ]);

      const { applicationsToUpgrade } = await service.findApplicationsToUpgrade(
        {
          applicationRegistrationId: APPLICATION_REGISTRATION_ID,
          workspaceCountLimit: 1,
        },
      );

      expect(applicationsToUpgrade.map(({ id }) => id)).toEqual(['app-1']);
    });

    it('does not query workspaces when every installation is up to date', async () => {
      applicationRepository.find.mockResolvedValue([
        {
          id: 'app-1',
          workspaceId: PROVISIONED_WORKSPACE_ID,
          version: '2.0.0',
        },
      ]);

      const { applicationsToUpgrade } = await service.findApplicationsToUpgrade(
        {
          applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        },
      );

      expect(applicationsToUpgrade).toEqual([]);
      expect(workspaceRepository.find).not.toHaveBeenCalled();
    });
  });
});
