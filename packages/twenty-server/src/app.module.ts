import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

import { GraphQLConfigService } from 'src/graphql-config/graphql-config.service';

import { CoreModule } from './core/core.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { GraphQLConfigModule } from './graphql-config/graphql-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [CoreModule, GraphQLConfigModule],
      useClass: GraphQLConfigService,
    }),
    HealthModule,
    IntegrationsModule,
    CoreModule,
    WorkspaceModule,
  ],
})
export class AppModule {}
