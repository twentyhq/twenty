import { Test } from '@nestjs/testing';
import { type Manifest } from 'twenty-shared/application';

import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { ApplicationManifestMigrationService } from 'src/engine/core-modules/application/application-manifest/application-manifest-migration.service';
import { ApplicationTranslationSyncService } from 'src/engine/core-modules/application/application-translation/application-translation-sync.service';

it('preserves the metadata preview when translation reporting fails or has no registration', async () => {
  const lookup = {
    findByUniversalIdentifier: jest
      .fn()
      .mockResolvedValue({ applicationRegistrationId: 'registration' }),
  };
  const metadataResult = {
    workspaceMigration: {},
    hasSchemaMetadataChanged: false,
  };
  const migration = {
    syncMetadataFromManifest: jest.fn().mockResolvedValue(metadataResult),
  };
  const translations = {
    getSyncActions: jest
      .fn()
      .mockRejectedValue(new Error('Database unavailable')),
  };
  const module = await Test.createTestingModule({
    providers: [
      ApplicationSyncService,
      { provide: ApplicationLookupService, useValue: lookup },
      { provide: ApplicationManifestMigrationService, useValue: migration },
      { provide: ApplicationTranslationSyncService, useValue: translations },
    ],
  })
    .useMocker(() => ({}))
    .compile();
  const service = module.get(ApplicationSyncService);
  const manifest = {
    application: { universalIdentifier: 'app' },
    translations: { 'fr-FR': { label: 'Bonjour' } },
  } as unknown as Manifest;
  try {
    expect(
      await service.synchronizeFromManifest({
        workspaceId: 'workspace',
        manifest,
        dryRun: true,
      }),
    ).toEqual({ ...metadataResult, translationActions: null });
    lookup.findByUniversalIdentifier.mockResolvedValue({
      applicationRegistrationId: null,
    });
    expect(
      await service.synchronizeFromManifest({
        workspaceId: 'workspace',
        manifest,
        dryRun: true,
      }),
    ).toEqual({ ...metadataResult, translationActions: null });
    translations.getSyncActions.mockResolvedValue([]);
    expect(
      await service.synchronizeFromManifest({
        workspaceId: 'workspace',
        applicationRegistrationId: 'owned-registration',
        manifest,
        dryRun: true,
      }),
    ).toEqual({ ...metadataResult, translationActions: [] });
    expect(translations.getSyncActions).toHaveBeenLastCalledWith({
      applicationRegistrationId: 'owned-registration',
      translations: manifest.translations,
    });
  } finally {
    await module.close();
  }
});
