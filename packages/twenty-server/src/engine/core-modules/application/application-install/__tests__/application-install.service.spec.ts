import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Manifest } from 'twenty-shared/application';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationUpgradeRoleGrantService } from 'src/engine/core-modules/application/application-manifest/services/application-upgrade-role-grant.service';
import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const APPROVED_VERSION = '2.0.0';

const appRegistration = {
  id: '20202020-0000-0000-0000-000000000002',
  universalIdentifier: 'test-app',
  sourceType: ApplicationRegistrationSourceType.TARBALL,
} as ApplicationRegistrationEntity;

const installedApplication = {
  id: '20202020-0000-0000-0000-000000000003',
  universalIdentifier: 'test-app',
  version: '1.0.0',
} as ApplicationEntity;

const manifest: Manifest = {
  application: {
    universalIdentifier: 'test-app',
    displayName: 'Test app',
    description: '',
    defaultRoleUniversalIdentifier: 'test-app-default-role',
    packageJsonChecksum: '',
    yarnLockChecksum: '',
  },
  objects: [],
  fields: [],
  logicFunctions: [],
  frontComponents: [],
  permissionFlags: [],
  roles: [],
  skills: [],
  agents: [],
  publicAssets: [],
  views: [],
  viewFields: [],
  navigationMenuItems: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  pageLayoutWidgets: [],
  commandMenuItems: [],
  timelineActivityTypes: [],
  settingsMenuItems: [],
};

const buildResolvedPackage = (version: string) => ({
  extractedDir: '/tmp/extracted',
  cleanupDir: '/tmp/cleanup',
  manifest,
  packageJson: { name: 'test-app', version },
});

describe('ApplicationInstallService', () => {
  let service: ApplicationInstallService;

  const appRegistrationRepository = { findOne: jest.fn() };
  const applicationService = { findByUniversalIdentifier: jest.fn() };
  const applicationPackageFetcherService = {
    resolvePackage: jest.fn(),
    cleanupExtractedDir: jest.fn(),
  };
  const applicationVersionValidationService = {
    validateVersionProgression: jest.fn(),
  };
  const applicationUpgradeRoleGrantService = {
    getDefaultRoleGrantsAddedByManifest: jest.fn(),
  };
  const cacheLockService = {
    withLock: jest.fn((callback: () => Promise<unknown>) => callback()),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationInstallService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: appRegistrationRepository,
        },
        { provide: ApplicationService, useValue: applicationService },
        {
          provide: ApplicationPackageFetcherService,
          useValue: applicationPackageFetcherService,
        },
        {
          provide: ApplicationVersionValidationService,
          useValue: applicationVersionValidationService,
        },
        { provide: ApplicationSyncService, useValue: {} },
        { provide: ApplicationManifestApplyService, useValue: {} },
        {
          provide: ApplicationUpgradeRoleGrantService,
          useValue: applicationUpgradeRoleGrantService,
        },
        { provide: FileStorageService, useValue: {} },
        { provide: LogicFunctionExecutorService, useValue: {} },
        { provide: CacheLockService, useValue: cacheLockService },
        {
          provide: getQueueToken(MessageQueue.applicationLifecycleHookQueue),
          useValue: {},
        },
        { provide: getQueueToken(MessageQueue.workspaceQueue), useValue: {} },
        { provide: WorkspaceCacheService, useValue: {} },
        {
          provide: MetricsService,
          useValue: { incrementCounterBy: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ApplicationInstallService);

    appRegistrationRepository.findOne.mockResolvedValue(appRegistration);
    applicationService.findByUniversalIdentifier.mockResolvedValue(
      installedApplication,
    );
    applicationUpgradeRoleGrantService.getDefaultRoleGrantsAddedByManifest.mockResolvedValue(
      [{ type: 'ALL_SETTINGS' }],
    );
  });

  it('does not apply an approval given for another version than the one resolved', async () => {
    applicationPackageFetcherService.resolvePackage.mockResolvedValue(
      buildResolvedPackage('3.0.0'),
    );

    await expect(
      service.installApplication({
        appRegistrationId: appRegistration.id,
        version: APPROVED_VERSION,
        workspaceId: WORKSPACE_ID,
        skipWorkspaceCompatibilityCheck: true,
        hasUserApprovedRoleGrants: true,
      }),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.UPGRADE_REQUIRES_ROLE_GRANTS_APPROVAL,
    });
  });

  it('applies the approval when the resolved version is the approved one', async () => {
    applicationPackageFetcherService.resolvePackage.mockResolvedValue(
      buildResolvedPackage(APPROVED_VERSION),
    );
    applicationVersionValidationService.validateVersionProgression.mockImplementation(
      () => {
        throw new Error('reached the install after the approval gate');
      },
    );

    await expect(
      service.installApplication({
        appRegistrationId: appRegistration.id,
        version: APPROVED_VERSION,
        workspaceId: WORKSPACE_ID,
        skipWorkspaceCompatibilityCheck: true,
        hasUserApprovedRoleGrants: true,
      }),
    ).rejects.toThrow('reached the install after the approval gate');

    expect(
      applicationUpgradeRoleGrantService.getDefaultRoleGrantsAddedByManifest,
    ).not.toHaveBeenCalled();
  });
});
