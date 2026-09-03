import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationDevelopmentService } from 'src/engine/core-modules/application/application-development/application-development.service';
import { ApplicationManifestApplyService } from 'src/engine/core-modules/application/application-manifest/application-manifest-apply.service';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationRegistrationAssetService } from 'src/engine/core-modules/application/application-registration/application-registration-asset.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const UNIVERSAL_IDENTIFIER = 'com.publisher.internal';
const REGISTRATION_ID = '20202020-0000-0000-0000-0000000000ff';

describe('ApplicationDevelopmentService', () => {
  let service: ApplicationDevelopmentService;

  const applicationRegistrationService = {
    findOneByUniversalIdentifierForWorkspace: jest.fn(),
  };

  const applicationService = {
    findByUniversalIdentifier: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      id: 'application-id',
      universalIdentifier: UNIVERSAL_IDENTIFIER,
    }),
  };

  const throttlerService = {
    tokenBucketThrottleOrThrow: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    applicationService.findByUniversalIdentifier.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationDevelopmentService,
        { provide: ApplicationService, useValue: applicationService },
        { provide: ApplicationSyncService, useValue: {} },
        { provide: ApplicationManifestApplyService, useValue: {} },
        {
          provide: ApplicationRegistrationService,
          useValue: applicationRegistrationService,
        },
        { provide: ApplicationRegistrationAssetService, useValue: {} },
        { provide: ApplicationVersionValidationService, useValue: {} },
        { provide: FileStorageService, useValue: {} },
        { provide: ThrottlerService, useValue: throttlerService },
        { provide: CacheLockService, useValue: {} },
      ],
    }).compile();

    service = module.get<ApplicationDevelopmentService>(
      ApplicationDevelopmentService,
    );
  });

  describe('createDevelopmentApplication', () => {
    it('binds to a registration owned by the calling workspace', async () => {
      applicationRegistrationService.findOneByUniversalIdentifierForWorkspace.mockResolvedValue(
        { id: REGISTRATION_ID, ownerWorkspaceId: WORKSPACE_ID },
      );

      const result = await service.createDevelopmentApplication({
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        name: 'My app',
        workspaceId: WORKSPACE_ID,
      });

      expect(result.universalIdentifier).toBe(UNIVERSAL_IDENTIFIER);
      expect(applicationService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
      );
    });

    it('refuses a registration owned by another workspace', async () => {
      applicationRegistrationService.findOneByUniversalIdentifierForWorkspace.mockResolvedValue(
        null,
      );

      await expect(
        service.createDevelopmentApplication({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          name: 'totally-mine',
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toThrow(ApplicationException);

      expect(applicationService.create).not.toHaveBeenCalled();
    });

    it('looks the registration up scoped to the calling workspace', async () => {
      applicationRegistrationService.findOneByUniversalIdentifierForWorkspace.mockResolvedValue(
        null,
      );

      await expect(
        service.createDevelopmentApplication({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          name: 'totally-mine',
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      });

      expect(
        applicationRegistrationService.findOneByUniversalIdentifierForWorkspace,
      ).toHaveBeenCalledWith(UNIVERSAL_IDENTIFIER, WORKSPACE_ID);
    });
  });
});
