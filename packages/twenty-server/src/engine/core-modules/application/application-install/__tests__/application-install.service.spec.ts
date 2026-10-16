import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { type ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { type ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import {
  type ApplicationPackageFetcherService,
  type ResolvedPackage,
} from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { type ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { type ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const APPLICATION_REGISTRATION_ID = 'application-registration-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier';
const LOGO_PATH = 'public/logo.png';
const LOGO_FILE_ID = 'logo-file-id';

const MANIFEST = {
  application: {
    universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    displayName: 'Application',
    logo: LOGO_PATH,
  },
  publicAssets: [{ filePath: LOGO_PATH }],
} as unknown as Manifest;

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

  const service = new ApplicationInstallService(
    {
      findOne: jest.fn().mockResolvedValue({
        id: APPLICATION_REGISTRATION_ID,
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        sourceType: ApplicationRegistrationSourceType.NPM,
        manifest: null,
      }),
    } as unknown as Repository<ApplicationRegistrationEntity>,
    applicationService as unknown as ApplicationService,
    applicationLookupService as unknown as ApplicationLookupService,
    applicationPackageFetcherService as unknown as ApplicationPackageFetcherService,
    {
      validateVersionProgression: jest.fn().mockReturnValue({ allowed: true }),
    } as unknown as ApplicationVersionValidationService,
    {
      ensureNpmVersion: jest.fn().mockResolvedValue(undefined),
    } as unknown as ApplicationRegistrationVersionService,
    {} as ApplicationSyncService,
    {
      applyManifestToWorkspace: jest
        .fn()
        .mockResolvedValue({ workspaceMigration: { actions: [] } }),
      refreshRegistrationFromManifest: jest.fn(),
    } as unknown as ApplicationManifestApplyService,
    fileStorageService as unknown as FileStorageService,
    {} as LogicFunctionExecutorService,
    {
      withLock: jest.fn((callback: () => Promise<boolean>) => callback()),
    } as unknown as CacheLockService,
    {} as MessageQueueService,
    {} as MessageQueueService,
    {} as WorkspaceCacheService,
    { incrementCounterBy: jest.fn() } as unknown as MetricsService,
  );

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
});
