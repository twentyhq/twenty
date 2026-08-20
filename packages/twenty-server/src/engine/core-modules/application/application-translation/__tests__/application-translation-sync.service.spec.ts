import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { ApplicationTranslationSyncService } from 'src/engine/core-modules/application/application-translation/application-translation-sync.service';
import { ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';

const APPLICATION_REGISTRATION_ID = '20202020-0000-0000-0000-000000000001';

describe('ApplicationTranslationSyncService', () => {
  let service: ApplicationTranslationSyncService;

  const repository = {
    find: jest.fn(),
    update: jest.fn(),
    insert: jest.fn(),
    softDelete: jest.fn(),
  };
  const cacheService = { invalidate: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTranslationSyncService,
        {
          provide: getRepositoryToken(ApplicationTranslationEntity),
          useValue: repository,
        },
        {
          provide: ApplicationTranslationCacheService,
          useValue: cacheService,
        },
      ],
    }).compile();

    service = module.get(ApplicationTranslationSyncService);
  });

  it('leaves stored translations alone when the manifest carries none', async () => {
    await service.syncFromManifest({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      translations: undefined,
    });

    expect(repository.find).not.toHaveBeenCalled();
    expect(repository.softDelete).not.toHaveBeenCalled();
    expect(cacheService.invalidate).not.toHaveBeenCalled();
  });

  it('prunes every stored locale when the manifest declares no translations', async () => {
    repository.find.mockResolvedValue([
      { id: 'row-1', locale: 'fr-FR', deletedAt: null },
    ]);

    await service.syncFromManifest({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      translations: {},
    });

    expect(repository.softDelete).toHaveBeenCalledWith(['row-1']);
  });

  it('prunes only the locales the manifest dropped', async () => {
    repository.find.mockResolvedValue([
      { id: 'row-fr', locale: 'fr-FR', deletedAt: null },
      { id: 'row-de', locale: 'de-DE', deletedAt: null },
    ]);

    await service.syncFromManifest({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      translations: { 'fr-FR': { abc123: 'Entreprise' } },
    });

    expect(repository.update).toHaveBeenCalledWith('row-fr', {
      messages: { abc123: 'Entreprise' },
      deletedAt: null,
    });
    expect(repository.softDelete).toHaveBeenCalledWith(['row-de']);
  });
});
