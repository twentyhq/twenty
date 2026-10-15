import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  SOURCE_LOCALE,
  type AppLocale,
  type APP_LOCALES,
} from 'twenty-shared/translations';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

import { ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { type CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';

type ApplicationCatalogsByLocale = Partial<
  Record<keyof typeof APP_LOCALES, Record<string, string>>
>;

const CACHE_TTL_MS = 30_000;

const EMPTY_CATALOG: Record<string, string> = {};

@Injectable()
export class ApplicationTranslationCacheService {
  private readonly catalogsMemoizer =
    new PromiseMemoizer<ApplicationCatalogsByLocale>(CACHE_TTL_MS);

  constructor(
    // applicationTranslation is a core cross-workspace table keyed by applicationRegistrationId, not workspaceId.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationTranslationEntity)
    private readonly applicationTranslationRepository: Repository<ApplicationTranslationEntity>,
    @InjectCacheStorage(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async getCurrentCatalog({
    applicationRegistrationId,
    locale,
  }: {
    applicationRegistrationId: string;
    locale: AppLocale;
  }): Promise<Record<string, string>> {
    if (locale === SOURCE_LOCALE) {
      return EMPTY_CATALOG;
    }

    return this.getCatalog({ applicationRegistrationId, locale });
  }

  async getCatalog({
    applicationRegistrationId,
    locale,
  }: {
    applicationRegistrationId: string;
    locale: keyof typeof APP_LOCALES;
  }): Promise<Record<string, string>> {
    const catalogsByLocale = await this.getCatalogsByLocale(
      applicationRegistrationId,
    );

    return catalogsByLocale[locale] ?? EMPTY_CATALOG;
  }

  async getCatalogsByLocale(
    applicationRegistrationId: string,
  ): Promise<ApplicationCatalogsByLocale> {
    const generationKey = `${this.getCacheKey(applicationRegistrationId)}:generation`;
    const cachedGeneration =
      await this.cacheStorageService.get<string>(generationKey);
    const generation = cachedGeneration ?? uuidv4();
    if (!isDefined(cachedGeneration)) {
      const initialized = await this.cacheStorageService.setIfAbsent(
        generationKey,
        generation,
        0,
      );
      if (!initialized) {
        return this.getCatalogsByLocale(applicationRegistrationId);
      }
    }
    const cacheKey: CacheKey = `${this.getCacheKey(applicationRegistrationId)}:${generation}`;
    const catalogsByLocale =
      await this.catalogsMemoizer.memoizePromiseAndExecute(
        cacheKey,
        async () => {
          const cachedCatalogs =
            await this.cacheStorageService.get<ApplicationCatalogsByLocale>(
              cacheKey,
            );
          if (isDefined(cachedCatalogs)) {
            return cachedCatalogs;
          }
          const catalogs = await this.loadCatalogsByLocale(
            applicationRegistrationId,
          );
          await this.cacheStorageService.set(cacheKey, catalogs, CACHE_TTL_MS);
          return catalogs;
        },
      );

    return catalogsByLocale ?? {};
  }

  async invalidate(applicationRegistrationId: string): Promise<void> {
    // A read started before commit must never populate the next generation.
    await this.cacheStorageService.set(
      `${this.getCacheKey(applicationRegistrationId)}:generation`,
      uuidv4(),
      0,
    );
    await this.catalogsMemoizer.clearKeys(
      this.getCacheKey(applicationRegistrationId),
    );
  }

  private getCacheKey(applicationRegistrationId: string): CacheKey {
    return `applicationTranslation-${applicationRegistrationId}`;
  }

  private async loadCatalogsByLocale(
    applicationRegistrationId: string,
  ): Promise<ApplicationCatalogsByLocale> {
    const rows = await this.applicationTranslationRepository.find({
      where: { applicationRegistrationId },
    });

    const catalogsByLocale: ApplicationCatalogsByLocale = {};

    for (const row of rows) {
      catalogsByLocale[row.locale] = row.messages;
    }

    return catalogsByLocale;
  }
}
