import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  SOURCE_LOCALE,
  type AppLocale,
  type APP_LOCALES,
} from 'twenty-shared/translations';
import chunk from 'lodash.chunk';
import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';
import { PromiseMemoizer } from 'src/engine/twenty-orm/storage/promise-memoizer.storage';
import { type CacheKey } from 'src/engine/twenty-orm/storage/types/cache-key.type';

type ApplicationCatalogsByLocale = Partial<
  Record<keyof typeof APP_LOCALES, Record<string, string>>
>;

const CACHE_TTL_MS = 30_000;
const BROADCAST_BATCH_SIZE = 50;

const EMPTY_CATALOG: Record<string, string> = {};

@Injectable()
export class ApplicationTranslationCacheService {
  private readonly logger = new Logger(ApplicationTranslationCacheService.name);
  private readonly catalogsMemoizer =
    new PromiseMemoizer<ApplicationCatalogsByLocale>(CACHE_TTL_MS);

  constructor(
    // applicationTranslation is a core cross-workspace table keyed by applicationRegistrationId, not workspaceId.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationTranslationEntity)
    private readonly applicationTranslationRepository: Repository<ApplicationTranslationEntity>,
    // A registration's catalog is shared by installations in every workspace.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
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

    // Other server processes can retain an older memoized catalog after apply.
    const row = await this.applicationTranslationRepository.findOne({
      where: { applicationRegistrationId, locale },
      select: { messages: true },
    });
    return row?.messages ?? EMPTY_CATALOG;
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
    const catalogsByLocale =
      await this.catalogsMemoizer.memoizePromiseAndExecute(
        this.getCacheKey(applicationRegistrationId),
        () => this.loadCatalogsByLocale(applicationRegistrationId),
      );

    return catalogsByLocale ?? {};
  }

  async invalidate(applicationRegistrationId: string): Promise<void> {
    await this.catalogsMemoizer.clearKeys(
      this.getCacheKey(applicationRegistrationId),
    );
  }

  async notifyCatalogUpdated(applicationRegistrationId: string): Promise<void> {
    try {
      const applications = await this.applicationRepository.find({
        where: { applicationRegistrationId },
        select: { id: true, workspaceId: true },
      });
      for (const batch of chunk(applications, BROADCAST_BATCH_SIZE)) {
        await Promise.all(
          batch.map((application) =>
            this.workspaceEventBroadcaster.broadcast({
              workspaceId: application.workspaceId,
              events: [
                {
                  type: 'updated',
                  entityName: 'application',
                  recordId: application.id,
                  properties: {
                    updatedFields: ['translationCatalog'],
                    after: {
                      id: application.id,
                      translationCatalogUpdated: true,
                    },
                  },
                },
              ],
            }),
          ),
        );
      }
    } catch (error) {
      this.logger.warn(
        'Failed to broadcast application translation changes',
        error,
      );
    }
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
