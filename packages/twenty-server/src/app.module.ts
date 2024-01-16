import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

import { GraphQLConfigService } from 'src/graphql-config.service';

import { CoreModule } from './core/core.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ExceptionInterceptor } from './interceptors/exception.interceptor';

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
    {
      provide: APP_INTERCEPTOR,
      useClass: ExceptionInterceptor,
    },
  ],
})
export class AppModule {}
