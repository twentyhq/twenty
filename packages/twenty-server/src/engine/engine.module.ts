import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

import { BaseGraphQLModule } from 'src/engine/api/graphql/base-graphql.module';
import { MetadataModule } from 'src/engine/api/metadata/metadata.module';
import { ApiRestModule } from 'src/engine/api/rest/api-rest.module';
import { FeaturesModule } from 'src/engine/features/features.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace/datasource/workspace-datasource.module';
import { WorkspaceManagerModule } from 'src/engine/workspace/manager/workspace-manager.module';
import { GraphQLConfigModule } from 'src/engine/api/graphql/graphql-config/graphql-config.module';
import { GraphQLConfigService } from 'src/engine/api/graphql/graphql-config/graphql-config.service';
import { IntegrationsModule } from 'src/integrations/integrations.module';
import { AuthModule } from 'src/engine/features/auth/auth.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [AuthModule, GraphQLConfigModule],
      useClass: GraphQLConfigService,
    }),
    IntegrationsModule,
    EngineModule,
  ],
  providers: [
    FeaturesModule,
    BaseGraphQLModule,
    MetadataModule,
    ApiRestModule,
    WorkspaceDataSourceModule,
    WorkspaceManagerModule,
  ],
})
export class EngineModule {}
