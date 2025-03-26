import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      useFactory: () => {
        return {
          path: '/subscription',
          autoSchemaFile: true,
          subscriptions: {
            'graphql-ws': true,
          },
        };
      },
    }),
  ],
})
export class SubscriptionGraphqlApiModule {}
