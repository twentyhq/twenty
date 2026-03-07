import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationNpmRegistrationService } from 'src/engine/core-modules/application/application-registration/application-npm-registration.service';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';

const createMockUser = (
  overrides: Partial<UserEntity> = {},
): UserEntity =>
  ({
    id: 'user-123',
    email: 'dev@example.com',
    isEmailVerified: true,
    ...overrides,
  }) as UserEntity;

describe('ApplicationNpmRegistrationService', () => {
  let service: ApplicationNpmRegistrationService;
  let applicationRegistrationService: jest.Mocked<ApplicationRegistrationService>;
  let applicationPackageFetcherService: jest.Mocked<ApplicationPackageFetcherService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationNpmRegistrationService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'APP_REGISTRY_URL') {
                return 'https://registry.npmjs.org';
              }

              return undefined;
            }),
          },
        },
        {
          provide: ApplicationPackageFetcherService,
          useValue: {
            resolveNpmPackage: jest.fn(),
            cleanupExtractedDir: jest.fn(),
          },
        },
        {
          provide: ApplicationRegistrationService,
          useValue: {
            findOneByUniversalIdentifier: jest.fn(),
            upsertFromNpmRegistration: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationNpmRegistrationService);
    applicationRegistrationService = module.get(
      ApplicationRegistrationService,
    );
    applicationPackageFetcherService = module.get(
      ApplicationPackageFetcherService,
    );
  });

  describe('registerNpmPackage', () => {
    it('should reject unverified email', async () => {
      const user = createMockUser({ isEmailVerified: false });

      await expect(
        service.registerNpmPackage('twenty-app-test', user, 'workspace-1'),
      ).rejects.toThrow(ApplicationRegistrationException);

      await expect(
        service.registerNpmPackage('twenty-app-test', user, 'workspace-1'),
      ).rejects.toMatchObject({
        code: ApplicationRegistrationExceptionCode.INVALID_INPUT,
      });
    });

    it('should reject packages without twenty-app- prefix', async () => {
      const user = createMockUser();

      await expect(
        service.registerNpmPackage('some-other-package', user, 'workspace-1'),
      ).rejects.toThrow();
    });

    it('should reject when user email is not in maintainers', async () => {
      const user = createMockUser({ email: 'notamaintainer@example.com' });

      jest.spyOn(service, 'fetchPackument').mockResolvedValueOnce({
        name: 'twenty-app-test',
        'dist-tags': { latest: '1.0.0' },
        maintainers: [{ name: 'other', email: 'other@example.com' }],
        versions: {},
      });

      await expect(
        service.registerNpmPackage(
          'twenty-app-test',
          user,
          'workspace-1',
        ),
      ).rejects.toThrow(ApplicationRegistrationException);
    });

    it('should register successfully when email matches a maintainer', async () => {
      const user = createMockUser({ email: 'Dev@Example.com' });

      const mockRegistration = {
        id: 'reg-1',
        universalIdentifier: 'uid-123',
        name: 'Test App',
      };

      jest.spyOn(service, 'fetchPackument').mockResolvedValueOnce({
        name: 'twenty-app-test',
        'dist-tags': { latest: '1.0.0' },
        maintainers: [{ name: 'dev', email: 'dev@example.com' }],
        versions: {},
      });

      jest
        .spyOn(service, 'fetchProvenanceMetadata')
        .mockResolvedValueOnce(null);

      applicationPackageFetcherService.resolveNpmPackage.mockResolvedValueOnce({
        extractedDir: '/tmp/test',
        cleanupDir: '/tmp/test-parent',
        manifest: {
          application: {
            universalIdentifier: 'uid-123',
            displayName: 'Test App',
            description: 'A test app',
            author: 'Dev',
          },
        } as any,
        packageJson: { name: 'twenty-app-test', version: '1.0.0' },
      });

      applicationRegistrationService.upsertFromNpmRegistration.mockResolvedValueOnce(
        mockRegistration as any,
      );

      const result = await service.registerNpmPackage(
        'twenty-app-test',
        user,
        'workspace-1',
      );

      expect(result).toEqual(mockRegistration);

      expect(
        applicationRegistrationService.upsertFromNpmRegistration,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          universalIdentifier: 'uid-123',
          packageName: 'twenty-app-test',
          ownerWorkspaceId: 'workspace-1',
          createdByUserId: 'user-123',
          isProvenanceVerified: false,
        }),
      );

      expect(
        applicationPackageFetcherService.cleanupExtractedDir,
      ).toHaveBeenCalledWith('/tmp/test-parent');
    });

    it('should store provenance metadata when available', async () => {
      const user = createMockUser();

      jest.spyOn(service, 'fetchPackument').mockResolvedValueOnce({
        name: 'twenty-app-test',
        'dist-tags': { latest: '1.0.0' },
        maintainers: [{ name: 'dev', email: 'dev@example.com' }],
        versions: {},
      });

      jest.spyOn(service, 'fetchProvenanceMetadata').mockResolvedValueOnce({
        repositoryUrl: 'https://github.com/user/twenty-app-test',
        hasProvenance: true,
      });

      applicationPackageFetcherService.resolveNpmPackage.mockResolvedValueOnce({
        extractedDir: '/tmp/test',
        cleanupDir: '/tmp/test-parent',
        manifest: {
          application: {
            universalIdentifier: 'uid-123',
            displayName: 'Test App',
          },
        } as any,
        packageJson: { name: 'twenty-app-test', version: '1.0.0' },
      });

      applicationRegistrationService.upsertFromNpmRegistration.mockResolvedValueOnce(
        {} as any,
      );

      await service.registerNpmPackage(
        'twenty-app-test',
        user,
        'workspace-1',
      );

      expect(
        applicationRegistrationService.upsertFromNpmRegistration,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          isProvenanceVerified: true,
          provenanceRepositoryUrl:
            'https://github.com/user/twenty-app-test',
          provenanceVerifiedAt: expect.any(Date),
        }),
      );
    });
  });
});
