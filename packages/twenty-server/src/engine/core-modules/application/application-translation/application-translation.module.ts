import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { ApplicationTranslationNotificationService } from 'src/engine/core-modules/application/application-translation/application-translation-notification.service';
import { ApplicationTranslationSyncService } from 'src/engine/core-modules/application/application-translation/application-translation-sync.service';
import { ApplicationTranslationEntity } from 'src/engine/core-modules/application/application-translation/application-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationTranslationEntity, ApplicationEntity]),
  ],
  providers: [
    ApplicationTranslationNotificationService,
    ApplicationTranslationCacheService,
    ApplicationTranslationSyncService,
  ],
  exports: [
    ApplicationTranslationCacheService,
    ApplicationTranslationSyncService,
  ],
})
export class ApplicationTranslationModule {}
