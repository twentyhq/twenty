import { type Repository } from 'typeorm';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { type ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';

const REGISTRATION_ID = '525c282e-030a-4a3e-90a0-d8aad0d33a93';

const buildService = (
  rows: Pick<ApplicationTranslationEntity, 'locale' | 'messages'>[],
) => {
  const find = jest.fn().mockImplementation(
    () =>
      // Resolve on a later macrotask so that all concurrent callers register
      // before the first load settles (otherwise the test can't observe a
      // stampede regression).
      new Promise((resolve) => setTimeout(() => resolve(rows), 5)),
  );

  const repository = {
    find,
  } as unknown as Repository<ApplicationTranslationEntity>;

  return {
    service: new ApplicationTranslationCacheService(repository),
    find,
  };
};

describe('ApplicationTranslationCacheService', () => {
  it('loads a registration catalog with a single query under concurrent access', async () => {
    const { service, find } = buildService([
      { locale: 'fr-FR', messages: { abc123: 'Bonjour' } },
    ]);

    const catalogs = await Promise.all(
      Array.from({ length: 10 }, () =>
        service.getCatalog({
          applicationRegistrationId: REGISTRATION_ID,
          locale: 'fr-FR',
        }),
      ),
    );

    // The in-flight memoizer must collapse the stampede into one DB read.
    expect(find).toHaveBeenCalledTimes(1);
    for (const catalog of catalogs) {
      expect(catalog).toEqual({ abc123: 'Bonjour' });
    }
  });

  it('serves subsequent reads from cache without re-querying', async () => {
    const { service, find } = buildService([
      { locale: 'fr-FR', messages: { abc123: 'Bonjour' } },
    ]);

    await service.getCatalog({
      applicationRegistrationId: REGISTRATION_ID,
      locale: 'fr-FR',
    });
    await service.getCatalog({
      applicationRegistrationId: REGISTRATION_ID,
      locale: 'fr-FR',
    });

    expect(find).toHaveBeenCalledTimes(1);
  });

  it('returns an empty catalog for a locale without translations', async () => {
    const { service } = buildService([
      { locale: 'fr-FR', messages: { abc123: 'Bonjour' } },
    ]);

    const catalog = await service.getCatalog({
      applicationRegistrationId: REGISTRATION_ID,
      locale: 'de-DE',
    });

    expect(catalog).toEqual({});
  });

  it('reloads the catalog after invalidation', async () => {
    const { service, find } = buildService([
      { locale: 'fr-FR', messages: { abc123: 'Bonjour' } },
    ]);

    await service.getCatalog({
      applicationRegistrationId: REGISTRATION_ID,
      locale: 'fr-FR',
    });

    service.invalidate(REGISTRATION_ID);
    // Let the async clear fully settle (drains microtasks) before reading again.
    await new Promise((resolve) => setTimeout(resolve, 0));

    await service.getCatalog({
      applicationRegistrationId: REGISTRATION_ID,
      locale: 'fr-FR',
    });

    expect(find).toHaveBeenCalledTimes(2);
  });
});
