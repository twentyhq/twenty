import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

import { GraphQLConfigService } from 'src/graphql-config.service';
import { GlobalExceptionFilter } from 'src/filters/global-exception.filter';

import { AppService } from './app.service';

import { CoreModule } from './core/core.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [CoreModule],
      useClass: GraphQLConfigService,
    }),
    HealthModule,
    IntegrationsModule,
    CoreModule,
    WorkspaceModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useValue: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
