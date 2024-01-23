import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler/dist';
import { APP_GUARD } from '@nestjs/core';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

import { GraphQLConfigService } from 'src/graphql-config.service';
import { ThrottlerConfigService } from 'src/throttler-config.service';
import { GqlHttpThrottlerGuard } from 'src/guards/gql-http-throttler.guard';

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
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerConfigService,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlHttpThrottlerGuard,
    },
  ],
})
export class AppModule {}
