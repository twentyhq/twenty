import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import {
  ApplicationPackageFetcherService,
  type ResolvedPackage,
} from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const APPLICATION_REGISTRATION_ID = 'application-registration-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const LOGO_PATH = 'public/logo.png';
const LOGO_FILE_ID = 'logo-file-id';

const MANIFEST: Manifest = {
  application: {
    universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    defaultRoleUniversalIdentifier: 'default-role-universal-identifier',
    displayName: 'Application',
    description: '',
    logo: LOGO_PATH,
    packageJsonChecksum: '',
    yarnLockChecksum: null,
  },
  publicAssets: [
    {
      filePath: LOGO_PATH,
      fileName: 'logo.png',
      fileType: 'image/png',
      checksum: null,
    },
  ],
  objects: [],
  fields: [],
  roles: [],
  viewFields: [],
  logicFunctions: [],
  frontComponents: [],
  permissionFlags: [],
  skills: [],
  agents: [],
  views: [],
  navigationMenuItems: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  pageLayoutWidgets: [],
  commandMenuItems: [],
  timelineActivityTypes: [],
  settingsMenuItems: [],
};

describe('ApplicationInstallService', () => {
  let extractedDir: string;

  const applicationService = {
    create: jest.fn(),
    update: jest.fn(),
  };
  const applicationLookupService = {
    findByUniversalIdentifier: jest.fn(),
  };
  const applicationPackageFetcherService = {
    resolvePackage: jest.fn(),
    cleanupExtractedDir: jest.fn(),
  };
  const fileStorageService = {
    writeFile: jest.fn(),
  };
  const appRegistrationRepository = {
    findOne: jest.fn(),
  };

  let service: ApplicationInstallService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ApplicationInstallService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: appRegistrationRepository,
        },
        { provide: ApplicationService, useValue: applicationService },
        {
          provide: ApplicationLookupService,
          useValue: applicationLookupService,
        },
        {
          provide: ApplicationPackageFetcherService,
          useValue: applicationPackageFetcherService,
        },
        {
          provide: ApplicationVersionValidationService,
          useValue: {
            validateVersionProgression: jest
              .fn()
              .mockReturnValue({ allowed: true }),
          },
        },
        {
          provide: ApplicationRegistrationVersionService,
          useValue: {
            ensureNpmVersion: jest.fn().mockResolvedValue(undefined),
          },
        },
        { provide: ApplicationSyncService, useValue: {} },
        {
          provide: ApplicationManifestApplyService,
          useValue: {
            applyManifestToWorkspace: jest
              .fn()
              .mockResolvedValue({ workspaceMigration: { actions: [] } }),
            refreshRegistrationFromManifest: jest.fn(),
          },
        },
        { provide: FileStorageService, useValue: fileStorageService },
        { provide: LogicFunctionExecutorService, useValue: {} },
        {
          provide: CacheLockService,
          useValue: {
            withLock: jest.fn((callback: () => Promise<boolean>) => callback()),
          },
        },
        {
          provide: getQueueToken(MessageQueue.applicationLifecycleHookQueue),
          useValue: {},
        },
        {
          provide: getQueueToken(MessageQueue.lambdaManagementQueue),
          useValue: {},
        },
        { provide: WorkspaceCacheService, useValue: {} },
        {
          provide: MetricsService,
          useValue: { incrementCounterBy: jest.fn() },
        },
        {
          provide: EventLogEmitterService,
          useValue: { recordApplicationPlatformEvents: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ApplicationInstallService);
  });

  const install = () =>
    service.installApplication({
      appRegistrationId: APPLICATION_REGISTRATION_ID,
      workspaceId: WORKSPACE_ID,
      skipWorkspaceCompatibilityCheck: true,
    });

  beforeEach(async () => {
    jest.clearAllMocks();

    extractedDir = await fs.mkdtemp(join(tmpdir(), 'application-install-'));

    await fs.mkdir(join(extractedDir, 'public'));
    await fs.writeFile(join(extractedDir, 'package.json'), '{}');
    await fs.writeFile(join(extractedDir, 'manifest.json'), '{}');
    await fs.writeFile(join(extractedDir, LOGO_PATH), 'logo');

    const resolvedPackage: ResolvedPackage = {
      extractedDir,
      cleanupDir: extractedDir,
      manifest: MANIFEST,
      packageJson: { version: '1.1.0' },
    };

    applicationPackageFetcherService.resolvePackage.mockResolvedValue(
      resolvedPackage,
    );
    fileStorageService.writeFile.mockResolvedValue({ id: LOGO_FILE_ID });
    applicationService.update.mockResolvedValue(undefined);
    appRegistrationRepository.findOne.mockResolvedValue({
      id: APPLICATION_REGISTRATION_ID,
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      sourceType: ApplicationRegistrationSourceType.NPM,
      manifest: null,
      isListed: false,
    });
  });

  afterEach(async () => {
    await fs.rm(extractedDir, { recursive: true, force: true });
  });

  it('sets the logo on a new application only once its file is stored', async () => {
    applicationLookupService.findByUniversalIdentifier.mockResolvedValue(null);
    applicationService.create.mockResolvedValue({
      id: APPLICATION_ID,
      logo: null,
      logoFileId: null,
      version: null,
    });

    let isLogoFileStored = false;
    const isLogoFileStoredWhenLogoIsSet: boolean[] = [];

    fileStorageService.writeFile.mockImplementation(
      async ({ fileFolder, resourcePath }) => {
        await Promise.resolve();

        if (
          fileFolder === FileFolder.PublicAsset &&
          resourcePath === LOGO_PATH
        ) {
          isLogoFileStored = true;
        }

        return { id: LOGO_FILE_ID };
      },
    );
    applicationService.update.mockImplementation(
      async (_applicationId, data) => {
        if ('logo' in data) {
          isLogoFileStoredWhenLogoIsSet.push(isLogoFileStored);
        }
      },
    );

    await install();

    expect(applicationService.create).toHaveBeenCalledTimes(1);
    expect(applicationService.create).toHaveBeenCalledWith(
      expect.not.objectContaining({ logo: expect.anything() }),
    );
    expect(applicationService.update).toHaveBeenCalledWith(APPLICATION_ID, {
      logo: LOGO_PATH,
      logoFileId: LOGO_FILE_ID,
      workspaceId: WORKSPACE_ID,
    });
    expect(isLogoFileStoredWhenLogoIsSet).toEqual([true]);
  });

  it('does not update an upgraded application whose logo is unchanged', async () => {
    applicationLookupService.findByUniversalIdentifier.mockResolvedValue({
      id: APPLICATION_ID,
      logo: LOGO_PATH,
      logoFileId: LOGO_FILE_ID,
      version: '1.0.0',
    });

    await install();

    expect(applicationService.create).not.toHaveBeenCalled();
    expect(applicationService.update).not.toHaveBeenCalledWith(
      APPLICATION_ID,
      expect.objectContaining({ logo: LOGO_PATH }),
    );
  });

  it.each([
    { isListed: true, autoUpgrade: true },
    { isListed: false, autoUpgrade: false },
  ])(
    'creates the application with auto upgrade $autoUpgrade when the registration listing is $isListed',
    async ({ isListed, autoUpgrade }) => {
      appRegistrationRepository.findOne.mockResolvedValue({
        id: APPLICATION_REGISTRATION_ID,
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        sourceType: ApplicationRegistrationSourceType.NPM,
        manifest: null,
        isListed,
      });
      applicationLookupService.findByUniversalIdentifier.mockResolvedValue(
        null,
      );
      applicationService.create.mockResolvedValue({
        id: APPLICATION_ID,
        logo: null,
        logoFileId: null,
        version: null,
      });

      await install();

      expect(applicationService.create).toHaveBeenCalledWith(
        expect.objectContaining({ autoUpgrade }),
      );
    },
  );
});
