import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationUpgradeRoleGrantService } from 'src/engine/core-modules/application/application-manifest/services/application-upgrade-role-grant.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  UPGRADE_WORKSPACE_APPLICATION_JOB_ENQUEUE_BATCH_SIZE,
  UPGRADE_WORKSPACE_APPLICATION_JOB_NAME,
  UPGRADE_WORKSPACE_APPLICATION_JOB_OPTIONS,
} from 'src/engine/core-modules/application/jobs/upgrade-workspace-application.job-constants';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { WorkspaceVersionService } from 'src/engine/workspace-manager/workspace-version/services/workspace-version.service';

const APPLICATION_REGISTRATION_ID = '20202020-0000-0000-0000-000000000001';
const OUTDATED_WORKSPACE_ID = '20202020-0000-0000-0000-000000000002';
const UP_TO_DATE_WORKSPACE_ID = '20202020-0000-0000-0000-000000000003';
const NON_PROVISIONED_WORKSPACE_ID = '20202020-0000-0000-0000-000000000004';
const TARGET_VERSION = '2.0.0';

const appRegistration = {
  id: APPLICATION_REGISTRATION_ID,
  universalIdentifier: 'test-app',
  sourceType: ApplicationRegistrationSourceType.NPM,
  latestAvailableVersion: TARGET_VERSION,
} as ApplicationRegistrationEntity;

const buildApplication = ({
  workspaceId,
  version,
  autoUpgrade = true,
}: {
  workspaceId: string;
  version: string | null;
  autoUpgrade?: boolean;
}) =>
  ({
    applicationRegistrationId: APPLICATION_REGISTRATION_ID,
    workspaceId,
    version,
    autoUpgrade,
  }) as ApplicationEntity;

describe('ApplicationUpgradeService', () => {
  let service: ApplicationUpgradeService;

  const appRegistrationRepository = {
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
  };
  const applicationRepository = { find: jest.fn(), findOne: jest.fn() };
  const applicationInstallService = { installApplication: jest.fn() };
  const applicationUpgradeRoleGrantService = {
    getDefaultRoleGrantsAddedByManifest: jest.fn(),
  };
  const workspaceVersionService = { getProvisionedWorkspaceIds: jest.fn() };
  const applicationUpgradeQueueService = { bulkAdd: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    appRegistrationRepository.findOne.mockResolvedValue(appRegistration);
    appRegistrationRepository.findOneOrFail.mockResolvedValue(appRegistration);
    workspaceVersionService.getProvisionedWorkspaceIds.mockResolvedValue([
      OUTDATED_WORKSPACE_ID,
      UP_TO_DATE_WORKSPACE_ID,
    ]);
    applicationUpgradeQueueService.bulkAdd.mockImplementation(
      (_jobName: string, jobs: unknown[]) =>
        jobs.map((_job, index) => `job-${index}`),
    );
    applicationInstallService.installApplication.mockResolvedValue(true);

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
          provide: ApplicationInstallService,
          useValue: applicationInstallService,
        },
        {
          provide: ApplicationUpgradeRoleGrantService,
          useValue: applicationUpgradeRoleGrantService,
        },
        {
          provide: WorkspaceVersionService,
          useValue: workspaceVersionService,
        },
        {
          provide: getQueueToken(MessageQueue.applicationUpgradeQueue),
          useValue: applicationUpgradeQueueService,
        },
      ],
    }).compile();

    service = module.get(ApplicationUpgradeService);
  });

  describe('enqueueApplicationUpgrades', () => {
    it('enqueues one job per outdated installation on a provisioned workspace', async () => {
      applicationRepository.find.mockResolvedValue([
        buildApplication({
          workspaceId: OUTDATED_WORKSPACE_ID,
          version: '1.0.0',
        }),
        buildApplication({
          workspaceId: UP_TO_DATE_WORKSPACE_ID,
          version: TARGET_VERSION,
        }),
        buildApplication({
          workspaceId: NON_PROVISIONED_WORKSPACE_ID,
          version: '1.0.0',
        }),
      ]);

      const jobIds = await service.enqueueApplicationUpgrades({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        onlyAutoUpgrade: true,
      });

      expect(jobIds).toEqual(['job-0']);
      expect(applicationUpgradeQueueService.bulkAdd).toHaveBeenCalledTimes(1);
      expect(applicationUpgradeQueueService.bulkAdd).toHaveBeenCalledWith(
        UPGRADE_WORKSPACE_APPLICATION_JOB_NAME,
        [
          {
            data: {
              applicationRegistrationId: APPLICATION_REGISTRATION_ID,
              workspaceId: OUTDATED_WORKSPACE_ID,
              onlyAutoUpgrade: true,
            },
          },
        ],
        UPGRADE_WORKSPACE_APPLICATION_JOB_OPTIONS,
      );
    });

    it('splits a large fan-out into several bulk adds', async () => {
      const workspaceIds = Array.from(
        { length: UPGRADE_WORKSPACE_APPLICATION_JOB_ENQUEUE_BATCH_SIZE + 1 },
        (_, index) =>
          `20202020-0000-0000-0000-${String(index).padStart(12, '0')}`,
      );

      workspaceVersionService.getProvisionedWorkspaceIds.mockResolvedValue(
        workspaceIds,
      );
      applicationRepository.find.mockResolvedValue(
        workspaceIds.map((workspaceId) =>
          buildApplication({ workspaceId, version: '1.0.0' }),
        ),
      );

      const jobIds = await service.enqueueApplicationUpgrades({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      });

      expect(jobIds).toHaveLength(workspaceIds.length);
      expect(applicationUpgradeQueueService.bulkAdd).toHaveBeenCalledTimes(2);
      expect(
        applicationUpgradeQueueService.bulkAdd.mock.calls[0][1],
      ).toHaveLength(UPGRADE_WORKSPACE_APPLICATION_JOB_ENQUEUE_BATCH_SIZE);
      expect(
        applicationUpgradeQueueService.bulkAdd.mock.calls[1][1],
      ).toHaveLength(1);
    });

    it('enqueues nothing when every installation already runs the latest version', async () => {
      applicationRepository.find.mockResolvedValue([
        buildApplication({
          workspaceId: UP_TO_DATE_WORKSPACE_ID,
          version: TARGET_VERSION,
        }),
      ]);

      const jobIds = await service.enqueueApplicationUpgrades({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      });

      expect(jobIds).toEqual([]);
      expect(applicationUpgradeQueueService.bulkAdd).not.toHaveBeenCalled();
    });

    it('enqueues nothing when the registration has no latest available version', async () => {
      appRegistrationRepository.findOneOrFail.mockResolvedValue({
        ...appRegistration,
        latestAvailableVersion: null,
      });

      const jobIds = await service.enqueueApplicationUpgrades({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      });

      expect(jobIds).toEqual([]);
      expect(applicationRepository.find).not.toHaveBeenCalled();
      expect(applicationUpgradeQueueService.bulkAdd).not.toHaveBeenCalled();
    });
  });

  describe('upgradeWorkspaceApplicationToLatestVersion', () => {
    it('installs the latest available version on an outdated workspace', async () => {
      applicationRepository.findOne.mockResolvedValue(
        buildApplication({
          workspaceId: OUTDATED_WORKSPACE_ID,
          version: '1.0.0',
        }),
      );

      await service.upgradeWorkspaceApplicationToLatestVersion({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        workspaceId: OUTDATED_WORKSPACE_ID,
        onlyAutoUpgrade: false,
      });

      expect(applicationInstallService.installApplication).toHaveBeenCalledWith(
        {
          appRegistrationId: APPLICATION_REGISTRATION_ID,
          version: TARGET_VERSION,
          workspaceId: OUTDATED_WORKSPACE_ID,
        },
      );
    });

    it('installs the latest available version on a workspace whose install never completed', async () => {
      applicationRepository.findOne.mockResolvedValue(
        buildApplication({ workspaceId: OUTDATED_WORKSPACE_ID, version: null }),
      );

      await service.upgradeWorkspaceApplicationToLatestVersion({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        workspaceId: OUTDATED_WORKSPACE_ID,
        onlyAutoUpgrade: false,
      });

      expect(
        applicationInstallService.installApplication,
      ).toHaveBeenCalledTimes(1);
    });

    it('skips an automatic upgrade on a workspace that disabled auto upgrade after the fan-out', async () => {
      applicationRepository.findOne.mockResolvedValue(
        buildApplication({
          workspaceId: OUTDATED_WORKSPACE_ID,
          version: '1.0.0',
          autoUpgrade: false,
        }),
      );

      await service.upgradeWorkspaceApplicationToLatestVersion({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        workspaceId: OUTDATED_WORKSPACE_ID,
        onlyAutoUpgrade: true,
      });

      expect(
        applicationInstallService.installApplication,
      ).not.toHaveBeenCalled();
    });

    it('still upgrades a workspace that disabled auto upgrade when the upgrade is manual', async () => {
      applicationRepository.findOne.mockResolvedValue(
        buildApplication({
          workspaceId: OUTDATED_WORKSPACE_ID,
          version: '1.0.0',
          autoUpgrade: false,
        }),
      );

      await service.upgradeWorkspaceApplicationToLatestVersion({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        workspaceId: OUTDATED_WORKSPACE_ID,
        onlyAutoUpgrade: false,
      });

      expect(
        applicationInstallService.installApplication,
      ).toHaveBeenCalledTimes(1);
    });

    it('skips a workspace that already runs the latest available version', async () => {
      applicationRepository.findOne.mockResolvedValue(
        buildApplication({
          workspaceId: UP_TO_DATE_WORKSPACE_ID,
          version: TARGET_VERSION,
        }),
      );

      await service.upgradeWorkspaceApplicationToLatestVersion({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        workspaceId: UP_TO_DATE_WORKSPACE_ID,
        onlyAutoUpgrade: false,
      });

      expect(
        applicationInstallService.installApplication,
      ).not.toHaveBeenCalled();
    });

    it('skips a workspace where the application is no longer installed', async () => {
      applicationRepository.findOne.mockResolvedValue(null);

      await service.upgradeWorkspaceApplicationToLatestVersion({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        workspaceId: OUTDATED_WORKSPACE_ID,
        onlyAutoUpgrade: false,
      });

      expect(
        applicationInstallService.installApplication,
      ).not.toHaveBeenCalled();
    });

    it('skips when the registration no longer exists', async () => {
      appRegistrationRepository.findOne.mockResolvedValue(null);

      await service.upgradeWorkspaceApplicationToLatestVersion({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        workspaceId: OUTDATED_WORKSPACE_ID,
        onlyAutoUpgrade: false,
      });

      expect(applicationRepository.findOne).not.toHaveBeenCalled();
      expect(
        applicationInstallService.installApplication,
      ).not.toHaveBeenCalled();
    });

    it('skips when the registration has no latest available version', async () => {
      appRegistrationRepository.findOne.mockResolvedValue({
        ...appRegistration,
        latestAvailableVersion: null,
      });

      await service.upgradeWorkspaceApplicationToLatestVersion({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        workspaceId: OUTDATED_WORKSPACE_ID,
        onlyAutoUpgrade: false,
      });

      expect(applicationRepository.findOne).not.toHaveBeenCalled();
      expect(
        applicationInstallService.installApplication,
      ).not.toHaveBeenCalled();
    });

    it('leaves the workspace on its version when the latest one needs role grants approval', async () => {
      applicationRepository.findOne.mockResolvedValue(
        buildApplication({
          workspaceId: OUTDATED_WORKSPACE_ID,
          version: '1.0.0',
        }),
      );
      applicationInstallService.installApplication.mockRejectedValue(
        new ApplicationException(
          'needs approval',
          ApplicationExceptionCode.UPGRADE_REQUIRES_ROLE_GRANTS_APPROVAL,
        ),
      );

      await expect(
        service.upgradeWorkspaceApplicationToLatestVersion({
          applicationRegistrationId: APPLICATION_REGISTRATION_ID,
          workspaceId: OUTDATED_WORKSPACE_ID,
          onlyAutoUpgrade: true,
        }),
      ).resolves.toBeUndefined();
    });

    it('still surfaces other upgrade failures', async () => {
      applicationRepository.findOne.mockResolvedValue(
        buildApplication({
          workspaceId: OUTDATED_WORKSPACE_ID,
          version: '1.0.0',
        }),
      );
      applicationInstallService.installApplication.mockRejectedValue(
        new ApplicationException(
          'boom',
          ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
        ),
      );

      await expect(
        service.upgradeWorkspaceApplicationToLatestVersion({
          applicationRegistrationId: APPLICATION_REGISTRATION_ID,
          workspaceId: OUTDATED_WORKSPACE_ID,
          onlyAutoUpgrade: true,
        }),
      ).rejects.toMatchObject({
        code: ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
      });
    });
  });

  describe('upgradeApplication', () => {
    it('forwards the role grants approval to the install', async () => {
      await service.upgradeApplication({
        appRegistrationId: APPLICATION_REGISTRATION_ID,
        targetVersion: TARGET_VERSION,
        workspaceId: OUTDATED_WORKSPACE_ID,
        hasUserApprovedRoleGrants: true,
      });

      expect(applicationInstallService.installApplication).toHaveBeenCalledWith(
        {
          appRegistrationId: APPLICATION_REGISTRATION_ID,
          version: TARGET_VERSION,
          workspaceId: OUTDATED_WORKSPACE_ID,
          skipWorkspaceCompatibilityCheck: undefined,
          hasUserApprovedRoleGrants: true,
        },
      );
    });

    it('does not swallow the approval error on a manual upgrade', async () => {
      applicationInstallService.installApplication.mockRejectedValue(
        new ApplicationException(
          'needs approval',
          ApplicationExceptionCode.UPGRADE_REQUIRES_ROLE_GRANTS_APPROVAL,
        ),
      );

      await expect(
        service.upgradeApplication({
          appRegistrationId: APPLICATION_REGISTRATION_ID,
          targetVersion: TARGET_VERSION,
          workspaceId: OUTDATED_WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: ApplicationExceptionCode.UPGRADE_REQUIRES_ROLE_GRANTS_APPROVAL,
      });
    });
  });

  describe('getRoleGrantsAddedByLatestVersion', () => {
    const APPLICATION_ID = '20202020-0000-0000-0000-000000000010';
    const latestManifest = {
      application: { defaultRoleUniversalIdentifier: 'role' },
      roles: [],
      permissionFlags: [],
    };
    const addedGrant = { type: 'ALL_SETTINGS' };

    beforeEach(() => {
      applicationUpgradeRoleGrantService.getDefaultRoleGrantsAddedByManifest.mockResolvedValue(
        [addedGrant],
      );
    });

    it('compares the installed default role with the latest manifest', async () => {
      applicationRepository.findOne.mockResolvedValue({
        ...buildApplication({
          workspaceId: OUTDATED_WORKSPACE_ID,
          version: '1.0.0',
        }),
        id: APPLICATION_ID,
        applicationRegistration: {
          ...appRegistration,
          manifest: latestManifest,
        },
      });

      await expect(
        service.getRoleGrantsAddedByLatestVersion({
          applicationId: APPLICATION_ID,
          workspaceId: OUTDATED_WORKSPACE_ID,
        }),
      ).resolves.toEqual([addedGrant]);

      expect(
        applicationUpgradeRoleGrantService.getDefaultRoleGrantsAddedByManifest,
      ).toHaveBeenCalledWith({
        workspaceId: OUTDATED_WORKSPACE_ID,
        applicationId: APPLICATION_ID,
        manifest: latestManifest,
      });
    });

    it('returns nothing when the workspace already runs the latest version', async () => {
      applicationRepository.findOne.mockResolvedValue({
        ...buildApplication({
          workspaceId: UP_TO_DATE_WORKSPACE_ID,
          version: TARGET_VERSION,
        }),
        id: APPLICATION_ID,
        applicationRegistration: {
          ...appRegistration,
          manifest: latestManifest,
        },
      });

      await expect(
        service.getRoleGrantsAddedByLatestVersion({
          applicationId: APPLICATION_ID,
          workspaceId: UP_TO_DATE_WORKSPACE_ID,
        }),
      ).resolves.toEqual([]);

      expect(
        applicationUpgradeRoleGrantService.getDefaultRoleGrantsAddedByManifest,
      ).not.toHaveBeenCalled();
    });

    it('throws when the application is not installed in the workspace', async () => {
      applicationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getRoleGrantsAddedByLatestVersion({
          applicationId: APPLICATION_ID,
          workspaceId: OUTDATED_WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      });
    });
  });
});
