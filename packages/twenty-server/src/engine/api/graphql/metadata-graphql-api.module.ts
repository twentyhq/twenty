import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

import { GraphQLConfigModule } from 'src/engine/api/graphql/graphql-config/graphql-config.module';
import { metadataModuleFactory } from 'src/engine/api/graphql/metadata.module-factory';
import { DataloaderModule } from 'src/engine/dataloaders/dataloader.module';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MetadataEngineModule } from 'src/engine/metadata-modules/metadata-engine.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

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
        CacheStorageNamespace.EngineWorkspace,
      ],
    }),
    MetadataEngineModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
  ],
})
export class MetadataGraphQLApiModule {}
