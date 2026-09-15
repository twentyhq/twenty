import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type TranslationsManifest } from 'twenty-shared/application';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';
import { computeApplicationTranslationSyncPlan } from 'src/engine/core-modules/application/application-translation/utils/compute-application-translation-sync-plan.util';

@Injectable()
export class ApplicationTranslationSyncService {
  constructor(
    // applicationTranslation is a core cross-workspace table keyed by applicationRegistrationId, not workspaceId.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationTranslationEntity)
    private readonly applicationTranslationRepository: Repository<ApplicationTranslationEntity>,
    private readonly applicationTranslationCacheService: ApplicationTranslationCacheService,
  ) {}

  async syncFromManifest({
    applicationRegistrationId,
    translations,
  }: {
    applicationRegistrationId: string;
    translations: TranslationsManifest | undefined;
  }): Promise<void> {
    // Absence says nothing about translations, so it must not prune: this
    // table is cross-workspace, and a sync from a toolchain that does not
    // compile them would drop the locales an app published, everywhere.
    if (!isDefined(translations)) {
      return;
    }

    const existingRows = await this.applicationTranslationRepository.find({
      where: { applicationRegistrationId },
      withDeleted: true,
    });

    const { rowsToUpdate, rowsToInsert, rowIdsToSoftDelete } =
      computeApplicationTranslationSyncPlan({ existingRows, translations });

    await Promise.all([
      ...rowsToUpdate.map(({ id, messages }) =>
        this.applicationTranslationRepository.update(id, {
          messages,
          deletedAt: null,
        }),
      ),
      ...rowsToInsert.map(({ locale, messages }) =>
        this.applicationTranslationRepository.insert({
          applicationRegistrationId,
          locale,
          messages,
        }),
      ),
    ]);

    if (rowIdsToSoftDelete.length > 0) {
      await this.applicationTranslationRepository.softDelete(
        rowIdsToSoftDelete,
      );
    }

    await this.applicationTranslationCacheService.invalidate(
      applicationRegistrationId,
    );
  }
}
