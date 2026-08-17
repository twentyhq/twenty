import { type ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { loadApplicationCatalogsByRegistrationId } from 'src/engine/dataloaders/utils/load-application-catalogs-by-registration-id.util';

describe('loadApplicationCatalogsByRegistrationId', () => {
  it('loads each unique application registration catalog once', async () => {
    const getCatalog = jest.fn(
      async ({
        applicationRegistrationId,
      }: {
        applicationRegistrationId: string;
      }) => ({
        applicationRegistrationId,
      }),
    );
    const applicationTranslationCacheService = {
      getCatalog,
    } as unknown as ApplicationTranslationCacheService;
    const flatApplicationMaps = {
      byId: {
        'application-1': { applicationRegistrationId: 'registration-1' },
        'application-2': { applicationRegistrationId: 'registration-1' },
        'application-3': { applicationRegistrationId: 'registration-2' },
      },
    } as unknown as FlatApplicationCacheMaps;

    const catalogs = await loadApplicationCatalogsByRegistrationId({
      applicationIds: [
        'application-1',
        'application-2',
        'application-3',
        'unknown-application',
      ],
      flatApplicationMaps,
      locale: 'en',
      applicationTranslationCacheService,
    });

    expect(getCatalog).toHaveBeenCalledTimes(2);
    expect(getCatalog).toHaveBeenCalledWith({
      applicationRegistrationId: 'registration-1',
      locale: 'en',
    });
    expect(getCatalog).toHaveBeenCalledWith({
      applicationRegistrationId: 'registration-2',
      locale: 'en',
    });
    expect(catalogs).toEqual(
      new Map([
        ['registration-1', { applicationRegistrationId: 'registration-1' }],
        ['registration-2', { applicationRegistrationId: 'registration-2' }],
      ]),
    );
  });
});
