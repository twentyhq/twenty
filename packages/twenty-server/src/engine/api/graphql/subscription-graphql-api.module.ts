import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

import { GraphQLConfigModule } from 'src/engine/api/graphql/graphql-config/graphql-config.module';
import { DataloaderModule } from 'src/engine/dataloaders/dataloader.module';
import { DataloaderService } from 'src/engine/dataloaders/dataloader.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MetadataEngineModule } from 'src/engine/metadata-modules/metadata-engine.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { subscriptionModuleFactory } from 'src/engine/api/graphql/subscription.module-factory';

@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      useFactory: subscriptionModuleFactory,
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
export class SubscriptionGraphqlApiModule {}
