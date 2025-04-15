import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriverConfig, YogaDriver } from '@graphql-yoga/nestjs';

import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';

@Module({
  imports: [
    SubscriptionsModule,
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      useFactory: () => {
        return {
          path: '/subscription',
          autoSchemaFile: true,
        };
      },
    }),
  ],
})
export class SubscriptionGraphqlApiModule {}
