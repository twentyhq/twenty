import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';

import { GraphQLConfigModule } from 'src/engine/api/graphql/graphql-config/graphql-config.module';
import { metadataModuleFactory } from 'src/engine/api/graphql/metadata.module-factory';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { I18nModule } from 'src/engine/core-modules/i18n/i18n.module';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataloaderModule } from 'src/engine/dataloaders/dataloader.module';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { MetadataEngineModule } from 'src/engine/metadata-modules/metadata-engine.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      useFactory: metadataModuleFactory,
      imports: [
        GraphQLConfigModule,
        DataloaderModule,
        MetricsModule,
        I18nModule,
      ],
      inject: [
        TwentyConfigService,
        ExceptionHandlerService,
        DataloaderService,
        CacheStorageNamespace.EngineWorkspace,
        MetricsService,
        I18nService,
      ],
    }),
    MetadataEngineModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
  ],
})
export class MetadataGraphQLApiModule {}
