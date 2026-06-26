import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';

type ApplicationCatalogsByLocale = Partial<
  Record<keyof typeof APP_LOCALES, Record<string, string>>
>;

type ApplicationTranslationCacheEntry = {
  catalogsByLocale: ApplicationCatalogsByLocale;
  loadedAt: number;
};

const CACHE_TTL_MS = 30_000;

const EMPTY_CATALOG: Record<string, string> = {};

@Injectable()
export class ApplicationTranslationCacheService {
  private readonly cache = new Map<string, ApplicationTranslationCacheEntry>();

  constructor(
    @InjectRepository(ApplicationTranslationEntity)
    private readonly applicationTranslationRepository: Repository<ApplicationTranslationEntity>,
  ) {}

  async getCatalog({
    applicationRegistrationId,
    locale,
  }: {
    applicationRegistrationId: string;
    locale: keyof typeof APP_LOCALES;
  }): Promise<Record<string, string>> {
    const entry = await this.getOrLoadEntry(applicationRegistrationId);

    return entry.catalogsByLocale[locale] ?? EMPTY_CATALOG;
  }

  invalidate(applicationRegistrationId: string): void {
    this.cache.delete(applicationRegistrationId);
  }

  private async getOrLoadEntry(
    applicationRegistrationId: string,
  ): Promise<ApplicationTranslationCacheEntry> {
    const cachedEntry = this.cache.get(applicationRegistrationId);

    if (
      isDefined(cachedEntry) &&
      Date.now() - cachedEntry.loadedAt < CACHE_TTL_MS
    ) {
      return cachedEntry;
    }

    const rows = await this.applicationTranslationRepository.find({
      where: { applicationRegistrationId },
    });

    const catalogsByLocale: ApplicationCatalogsByLocale = {};

    for (const row of rows) {
      catalogsByLocale[row.locale] = row.messages;
    }

    const entry: ApplicationTranslationCacheEntry = {
      catalogsByLocale,
      loadedAt: Date.now(),
    };

    this.cache.set(applicationRegistrationId, entry);

    return entry;
  }
}
