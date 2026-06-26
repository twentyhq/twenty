import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ManifestTranslations } from 'twenty-shared/application';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';

@Injectable()
export class ApplicationTranslationSyncService {
  constructor(
    @InjectRepository(ApplicationTranslationEntity)
    private readonly applicationTranslationRepository: Repository<ApplicationTranslationEntity>,
    private readonly applicationTranslationCacheService: ApplicationTranslationCacheService,
  ) {}

  async syncFromManifest({
    applicationRegistrationId,
    translations,
  }: {
    applicationRegistrationId: string;
    translations: ManifestTranslations | undefined;
  }): Promise<void> {
    const existingRows = await this.applicationTranslationRepository.find({
      where: { applicationRegistrationId },
      withDeleted: true,
    });

    const existingRowByLocale = new Map(
      existingRows.map((row) => [row.locale, row]),
    );

    const manifestLocales = new Set<keyof typeof APP_LOCALES>();
    const upsertPromises: Promise<unknown>[] = [];

    for (const [locale, messages] of Object.entries(translations ?? {}) as [
      keyof typeof APP_LOCALES,
      Record<string, string>,
    ][]) {
      manifestLocales.add(locale);

      const existingRow = existingRowByLocale.get(locale);

      if (isDefined(existingRow)) {
        upsertPromises.push(
          this.applicationTranslationRepository.update(existingRow.id, {
            messages,
            deletedAt: null,
          }),
        );
      } else {
        upsertPromises.push(
          this.applicationTranslationRepository.insert({
            applicationRegistrationId,
            locale,
            messages,
          }),
        );
      }
    }

    await Promise.all(upsertPromises);

    const rowsToSoftDelete = existingRows.filter(
      (row) => !manifestLocales.has(row.locale) && !isDefined(row.deletedAt),
    );

    if (rowsToSoftDelete.length > 0) {
      await this.applicationTranslationRepository.softDelete(
        rowsToSoftDelete.map((row) => row.id),
      );
    }

    this.applicationTranslationCacheService.invalidate(applicationRegistrationId);
  }
}
