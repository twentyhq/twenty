import { Test, type TestingModule } from '@nestjs/testing';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationDevelopmentService } from 'src/engine/core-modules/application/application-development/application-development.service';
import {
  APP_DEV_FILE_UPLOAD_RATE_LIMIT_MAX,
  APP_DEV_FILE_UPLOAD_RATE_LIMIT_WINDOW_MS,
  APP_DEV_RATE_LIMIT_MAX,
  APP_DEV_RATE_LIMIT_WINDOW_MS,
} from 'src/engine/core-modules/application/application-development/constants/application-development.constants';
import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationManifestExportService } from 'src/engine/core-modules/application/application-manifest/services/application-manifest-export.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

const WORKSPACE_ID = 'test-workspace-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'test-app-uid';

describe('ApplicationDevelopmentService', () => {
  let service: ApplicationDevelopmentService;

  const throttlerService = {
    tokenBucketThrottleOrThrow: jest.fn().mockResolvedValue(undefined),
  };

  const applicationService = {
    findByUniversalIdentifier: jest.fn().mockResolvedValue({
      id: 'app-id',
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    }),
  };

  const applicationRegistrationService = {
    findOneByUniversalIdentifierGlobal: jest.fn().mockResolvedValue({
      id: 'app-reg-id',
      ownerWorkspaceId: WORKSPACE_ID,
    }),
  };

  const fileStorageService = {
    writeFile: jest.fn().mockResolvedValue({
      id: 'file-id',
      resourcePath: 'index.ts',
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDevelopmentService,
        { provide: ApplicationService, useValue: applicationService },
        { provide: ApplicationSyncService, useValue: {} },
        { provide: ApplicationManifestApplyService, useValue: {} },
        { provide: ApplicationManifestExportService, useValue: {} },
        {
          provide: ApplicationRegistrationService,
          useValue: applicationRegistrationService,
        },
        { provide: ApplicationRegistrationAssetService, useValue: {} },
        { provide: ApplicationVersionValidationService, useValue: {} },
        { provide: FileStorageService, useValue: fileStorageService },
        { provide: ThrottlerService, useValue: throttlerService },
        { provide: CacheLockService, useValue: {} },
      ],
    }).compile();

    service = module.get<ApplicationDevelopmentService>(
      ApplicationDevelopmentService,
    );
  });

  describe('uploadApplicationFile', () => {
    it('should throttle file uploads using dedicated bucket with higher rate limit', async () => {
      await service.uploadApplicationFile({
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fileFolder: FileFolder.Source,
        filePath: 'index.ts',
        getFileBuffer: async () => Buffer.from('console.log("hello")'),
      });

      expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
        `app-dev-file-upload:${WORKSPACE_ID}:${APPLICATION_UNIVERSAL_IDENTIFIER}`,
        1,
        APP_DEV_FILE_UPLOAD_RATE_LIMIT_MAX,
        APP_DEV_FILE_UPLOAD_RATE_LIMIT_WINDOW_MS,
      );
    });
  });

  describe('createDevelopmentApplication', () => {
    it('should throttle createDevelopmentApplication using general app-dev bucket', async () => {
      await service.createDevelopmentApplication({
        universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        name: 'Test App',
        workspaceId: WORKSPACE_ID,
      });

      expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
        `app-dev:${WORKSPACE_ID}:${APPLICATION_UNIVERSAL_IDENTIFIER}`,
        1,
        APP_DEV_RATE_LIMIT_MAX,
        APP_DEV_RATE_LIMIT_WINDOW_MS,
      );
    });
  });
});
