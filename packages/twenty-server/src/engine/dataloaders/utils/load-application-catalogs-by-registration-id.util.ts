import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';

export const loadApplicationCatalogsByRegistrationId = async ({
  applicationIds,
  flatApplicationMaps,
  locale,
  applicationTranslationCacheService,
}: {
  applicationIds: string[];
  flatApplicationMaps: FlatApplicationCacheMaps;
  locale: keyof typeof APP_LOCALES;
  applicationTranslationCacheService: ApplicationTranslationCacheService;
}): Promise<Map<string, Record<string, string>>> => {
  const registrationIds = [
    ...new Set(
      applicationIds
        .map(
          (applicationId) =>
            flatApplicationMaps.byId[applicationId]?.applicationRegistrationId,
        )
        .filter(isDefined),
    ),
  ];

  const catalogByRegistrationId = new Map<string, Record<string, string>>();

  await Promise.all(
    registrationIds.map(async (applicationRegistrationId) => {
      const catalog = await applicationTranslationCacheService.getCatalog({
        applicationRegistrationId,
        locale,
      });

      catalogByRegistrationId.set(applicationRegistrationId, catalog);
    }),
  );

  return catalogByRegistrationId;
};
