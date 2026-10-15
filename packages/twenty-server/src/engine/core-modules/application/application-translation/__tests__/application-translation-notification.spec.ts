import { type Repository } from 'typeorm';
import { ApplicationTranslationSyncService } from 'src/engine/core-modules/application/application-translation/application-translation-sync.service';
import { type ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { type ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';

const repository = {
  find: jest.fn(),
  insert: jest.fn(),
  manager: { transaction: jest.fn() },
};
const cache = { invalidate: jest.fn(), notifyCatalogUpdated: jest.fn() };
const service = new ApplicationTranslationSyncService(
  repository as unknown as Repository<ApplicationTranslationEntity>,
  cache as unknown as ApplicationTranslationCacheService,
);
const input = {
  applicationRegistrationId: 'registration',
  translations: { 'fr-FR': { label: 'Bonjour' } },
};

beforeEach(() => {
  jest.resetAllMocks();
  repository.find.mockResolvedValue([]);
});

it('notifies only after commit and does not wait for notification delivery', async () => {
  let finishNotification: () => void = () => undefined;
  cache.notifyCatalogUpdated.mockReturnValue(
    new Promise<void>((resolve) => {
      finishNotification = resolve;
    }),
  );
  let hasCommitted = false;
  repository.manager.transaction.mockImplementation(async (run) => {
    const actions = await run({ getRepository: () => repository });
    expect(cache.notifyCatalogUpdated).not.toHaveBeenCalled();
    hasCommitted = true;
    return actions;
  });
  cache.invalidate.mockImplementation(() => {
    expect(hasCommitted).toBe(true);
  });
  await service.syncFromManifest(input);
  expect(cache.notifyCatalogUpdated).toHaveBeenCalledWith('registration');
  expect(
    cache.notifyCatalogUpdated.mock.invocationCallOrder[0],
  ).toBeGreaterThan(cache.invalidate.mock.invocationCallOrder[0]);
  finishNotification();
});

it('clears the local memo but never notifies when a transaction rolls back', async () => {
  repository.manager.transaction.mockImplementation(async (run) => {
    await run({ getRepository: () => repository });
    throw new Error('Commit failed');
  });
  await expect(service.syncFromManifest(input)).rejects.toThrow(
    'Commit failed',
  );
  expect(cache.invalidate).toHaveBeenCalledWith('registration');
  expect(cache.notifyCatalogUpdated).not.toHaveBeenCalled();
});
