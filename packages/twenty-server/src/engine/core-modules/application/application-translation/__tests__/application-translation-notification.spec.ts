import { type Repository } from 'typeorm';
import { ApplicationTranslationSyncService } from 'src/engine/core-modules/application/application-translation/application-translation-sync.service';
import { type ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { type ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';

it('only notifies after successful persistence and does not wait for notification delivery', async () => {
  const repository = {
    find: jest.fn().mockResolvedValue([]),
    insert: jest.fn(),
  };
  let finishNotification: () => void = () => undefined;
  const notification = new Promise<void>((resolve) => {
    finishNotification = resolve;
  });
  const cache = {
    invalidate: jest.fn(),
    notifyCatalogUpdated: jest.fn().mockReturnValue(notification),
  };
  const service = new ApplicationTranslationSyncService(
    repository as unknown as Repository<ApplicationTranslationEntity>,
    cache as unknown as ApplicationTranslationCacheService,
  );
  const input = {
    applicationRegistrationId: 'registration',
    translations: { 'fr-FR': { label: 'Bonjour' } },
  };
  repository.insert.mockRejectedValueOnce(new Error('Write failed'));
  await expect(service.syncFromManifest(input)).rejects.toThrow('Write failed');
  expect(cache.notifyCatalogUpdated).not.toHaveBeenCalled();
  await service.syncFromManifest(input);
  expect(cache.notifyCatalogUpdated).toHaveBeenCalledWith('registration');
  expect(
    cache.notifyCatalogUpdated.mock.invocationCallOrder[0],
  ).toBeGreaterThan(cache.invalidate.mock.invocationCallOrder[0]);
  finishNotification();
});
