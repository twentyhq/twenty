import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type TranslationsManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';
import { type ApplicationTranslationSyncAction } from 'src/engine/core-modules/application/application-translation/types/application-translation-sync-action.type';
import { computeApplicationTranslationSyncActions } from 'src/engine/core-modules/application/application-translation/utils/compute-application-translation-sync-actions.util';
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

  async getSyncActions({
    applicationRegistrationId,
    translations,
  }: {
    applicationRegistrationId: string;
    translations: TranslationsManifest | undefined;
  }): Promise<ApplicationTranslationSyncAction[]> {
    if (!isDefined(translations)) {
      return [];
    }

    const existingRows = await this.applicationTranslationRepository.find({
      where: { applicationRegistrationId },
    });

    return computeApplicationTranslationSyncActions({
      existingRows,
      translations,
    });
  }

  async syncFromManifest({
    applicationRegistrationId,
    translations,
  }: {
    applicationRegistrationId: string;
    translations: TranslationsManifest | undefined;
  }): Promise<ApplicationTranslationSyncAction[]> {
    // Absence must not prune: this cross-workspace table would lose the app's locales everywhere
    if (!isDefined(translations)) {
      return [];
    }

    let actions: ApplicationTranslationSyncAction[];
    try {
      actions = await this.applicationTranslationRepository.manager.transaction(
        async (manager) => {
          const repository = manager.getRepository(
            ApplicationTranslationEntity,
          );
          const existingRows = await repository.find({
            where: { applicationRegistrationId },
            withDeleted: true,
          });
          const actions = computeApplicationTranslationSyncActions({
            existingRows,
            translations,
          });
          const { rowsToUpdate, rowsToInsert, rowIdsToSoftDelete } =
            computeApplicationTranslationSyncPlan({
              existingRows,
              translations,
            });

          for (const { id, messages } of rowsToUpdate) {
            await repository.update(id, { messages, deletedAt: null });
          }
          for (const { locale, messages } of rowsToInsert) {
            await repository.insert({
              applicationRegistrationId,
              locale,
              messages,
            });
          }
          if (rowIdsToSoftDelete.length > 0) {
            await repository.softDelete(rowIdsToSoftDelete);
          }

          return actions;
        },
      );
    } finally {
      await this.applicationTranslationCacheService.invalidate(
        applicationRegistrationId,
      );
    }

    if (actions.length > 0) {
      void this.applicationTranslationCacheService.notifyCatalogUpdated(
        applicationRegistrationId,
      );
    }
    return actions;
  }
}
