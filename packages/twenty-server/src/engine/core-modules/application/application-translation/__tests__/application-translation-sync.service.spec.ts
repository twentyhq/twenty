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
    repository.find.mockResolvedValue([]);

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

    expect(repository.find).toHaveBeenCalledTimes(0);
    expect(repository.update).toHaveBeenCalledTimes(0);
    expect(repository.insert).toHaveBeenCalledTimes(0);
    expect(repository.softDelete).toHaveBeenCalledTimes(0);
    expect(cacheService.invalidate).toHaveBeenCalledTimes(0);
  });

  it('applies the manifest when it declares translations', async () => {
    repository.find.mockResolvedValue([
      { id: 'row-de', locale: 'de-DE', deletedAt: null },
    ]);

    await service.syncFromManifest({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      translations: { 'fr-FR': { abc123: 'Entreprise' } },
    });

    expect(repository.insert).toHaveBeenCalledTimes(1);
    expect(repository.insert).toHaveBeenCalledWith({
      applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      locale: 'fr-FR',
      messages: { abc123: 'Entreprise' },
    });
    expect(repository.softDelete).toHaveBeenCalledTimes(1);
    expect(repository.softDelete).toHaveBeenCalledWith(['row-de']);
    expect(cacheService.invalidate).toHaveBeenCalledTimes(1);
  });
});
