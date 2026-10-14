import { type Manifest } from 'twenty-shared/application';

import {
  ApplicationPackageFetcherService,
  type ResolvedPackage,
} from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';

const REGISTRATION_UNIVERSAL_IDENTIFIER =
  '4f1c2a3b-5d6e-4f70-8a9b-0c1d2e3f4a5b';

const buildResolvedPackage = (
  universalIdentifier: string,
): ResolvedPackage => ({
  extractedDir: '/tmp/extracted',
  cleanupDir: '/tmp/cleanup',
  manifest: { application: { universalIdentifier } } as Manifest,
  packageJson: { name: 'twenty-app-test', version: '1.0.0' },
});

const APP_REGISTRATION = {
  id: 'registration-id',
  universalIdentifier: REGISTRATION_UNIVERSAL_IDENTIFIER,
  sourceType: ApplicationRegistrationSourceType.NPM,
  sourcePackage: 'twenty-app-test',
} as ApplicationRegistrationEntity;

describe('ApplicationPackageFetcherService.resolvePackage', () => {
  let service: ApplicationPackageFetcherService;
  let resolveFromSourceSpy: jest.SpyInstance;
  let cleanupSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new ApplicationPackageFetcherService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    resolveFromSourceSpy = jest.spyOn(
      service as unknown as {
        resolveFromSource: () => Promise<ResolvedPackage | null>;
      },
      'resolveFromSource',
    );
    cleanupSpy = jest
      .spyOn(service, 'cleanupExtractedDir')
      .mockResolvedValue(undefined);
  });

  it('should accept a manifest identifier that differs only in casing and normalize it', async () => {
    resolveFromSourceSpy.mockResolvedValue(
      buildResolvedPackage(REGISTRATION_UNIVERSAL_IDENTIFIER.toUpperCase()),
    );

    const resolvedPackage = await service.resolvePackage(APP_REGISTRATION);

    expect(resolvedPackage?.manifest.application.universalIdentifier).toBe(
      REGISTRATION_UNIVERSAL_IDENTIFIER,
    );
    expect(cleanupSpy).not.toHaveBeenCalled();
  });

  it('should reject a manifest declaring a different application and clean up', async () => {
    resolveFromSourceSpy.mockResolvedValue(
      buildResolvedPackage('9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d'),
    );

    await expect(
      service.resolvePackage(APP_REGISTRATION),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.PACKAGE_RESOLUTION_FAILED,
    });
    expect(cleanupSpy).toHaveBeenCalledWith('/tmp/cleanup');
  });
});
