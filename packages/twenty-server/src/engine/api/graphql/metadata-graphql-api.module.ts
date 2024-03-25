import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriverConfig, YogaDriver } from '@graphql-yoga/nestjs';

import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { MetadataEngineModule } from 'src/engine/metadata-modules/metadata-engine.module';
import { CreateContextFactory } from 'src/engine/api/graphql/graphql-config/factories/create-context.factory';
import { GraphQLConfigModule } from 'src/engine/api/graphql/graphql-config/graphql-config.module';
import { metadataModuleFactory } from 'src/engine/api/graphql/metadata.module-factory';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/integrations/exception-handler/exception-handler.service';

@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      useFactory: metadataModuleFactory,
      imports: [GraphQLConfigModule],
      inject: [
        EnvironmentService,
        ExceptionHandlerService,
        CreateContextFactory,
      ],
    }),
    MetadataEngineModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
  ],
})
export class MetadataGraphQLApiModule {}
