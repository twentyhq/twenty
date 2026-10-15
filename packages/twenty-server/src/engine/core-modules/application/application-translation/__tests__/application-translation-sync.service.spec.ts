import { type Repository } from 'typeorm';

import { ApplicationTranslationSyncService } from 'src/engine/core-modules/application/application-translation/application-translation-sync.service';
import { type ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { type ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';

describe('ApplicationTranslationSyncService reporting', () => {
  const repository = {
    find: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    manager: { transaction: jest.fn() },
  };
  const cache = { invalidate: jest.fn() };
  const service = new ApplicationTranslationSyncService(
    repository as unknown as Repository<ApplicationTranslationEntity>,
    cache as unknown as ApplicationTranslationCacheService,
  );
  const input = {
    applicationRegistrationId: 'registration',
    translations: { 'fr-FR': { label: 'Nouveau' } },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    repository.manager.transaction.mockImplementation(async (run) =>
      run({ getRepository: () => repository }),
    );
    repository.find.mockResolvedValue([
      {
        id: 'row',
        locale: 'fr-FR',
        messages: { label: 'Ancien' },
        deletedAt: null,
      },
    ]);
  });

  it('previews the same change that apply reports without writing or invalidating the cache', async () => {
    const preview = await service.getSyncActions(input);
    expect(repository.find).toHaveBeenCalledWith({
      where: { applicationRegistrationId: 'registration' },
    });
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.insert).not.toHaveBeenCalled();
    expect(repository.softDelete).not.toHaveBeenCalled();
    expect(cache.invalidate).not.toHaveBeenCalled();
    expect(await service.syncFromManifest(input)).toEqual(preview);
    expect(repository.update).toHaveBeenCalledWith('row', {
      messages: { label: 'Nouveau' },
      deletedAt: null,
    });
    expect(cache.invalidate).toHaveBeenCalledWith('registration');
  });

  it('does not claim applied actions when persistence fails', async () => {
    repository.update.mockRejectedValue(new Error('database unavailable'));
    await expect(service.syncFromManifest(input)).rejects.toThrow(
      'database unavailable',
    );
  });

  it('does not query or prune when translations are absent', async () => {
    expect(
      await service.getSyncActions({ ...input, translations: undefined }),
    ).toEqual([]);
    expect(
      await service.syncFromManifest({ ...input, translations: undefined }),
    ).toEqual([]);
    expect(repository.find).not.toHaveBeenCalled();
    expect(cache.invalidate).not.toHaveBeenCalled();
  });
});
