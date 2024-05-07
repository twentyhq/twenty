import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriverConfig, YogaDriver } from '@graphql-yoga/nestjs';

import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { MetadataEngineModule } from 'src/engine/metadata-modules/metadata-engine.module';
import { GraphQLConfigModule } from 'src/engine/api/graphql/graphql-config/graphql-config.module';
import { metadataModuleFactory } from 'src/engine/api/graphql/metadata.module-factory';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';
import { DataloaderModule } from 'src/engine/dataloaders/dataloader.module';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { CacheStorageModule } from 'src/engine/integrations/cache-storage/cache-storage.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      useFactory: metadataModuleFactory,
      imports: [GraphQLConfigModule, DataloaderModule],
      inject: [
        EnvironmentService,
        ExceptionHandlerService,
        DataloaderService,
        CacheStorageNamespace.WorkspaceSchema,
      ],
    }),
    MetadataEngineModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
    CacheStorageModule,
  ],
})
export class MetadataGraphQLApiModule {}
