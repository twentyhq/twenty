import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
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
}: {
  workspaceId: string;
  version: string | null;
}) =>
  ({
    applicationRegistrationId: APPLICATION_REGISTRATION_ID,
    workspaceId,
    version,
    autoUpgrade: true,
  }) as ApplicationEntity;

describe('ApplicationUpgradeService', () => {
  let service: ApplicationUpgradeService;

  const appRegistrationRepository = { findOneOrFail: jest.fn() };
  const applicationRepository = { find: jest.fn(), findOne: jest.fn() };
  const applicationInstallService = { installApplication: jest.fn() };
  const workspaceVersionService = { getProvisionedWorkspaceIds: jest.fn() };
  const applicationUpgradeQueueService = { bulkAdd: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

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
            },
          },
        ],
        UPGRADE_WORKSPACE_APPLICATION_JOB_OPTIONS,
      );
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
      });

      expect(
        applicationInstallService.installApplication,
      ).not.toHaveBeenCalled();
    });

    it('skips when the registration has no latest available version', async () => {
      appRegistrationRepository.findOneOrFail.mockResolvedValue({
        ...appRegistration,
        latestAvailableVersion: null,
      });

      await service.upgradeWorkspaceApplicationToLatestVersion({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        workspaceId: OUTDATED_WORKSPACE_ID,
      });

      expect(applicationRepository.findOne).not.toHaveBeenCalled();
      expect(
        applicationInstallService.installApplication,
      ).not.toHaveBeenCalled();
    });
  });
});
