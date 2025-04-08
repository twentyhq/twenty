import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [AccessTokenService],
      useFactory: (accessTokenService: AccessTokenService) => {
        return {
          path: '/subscription',
          autoSchemaFile: true,
          subscriptions: {
            'graphql-ws': {
              onConnect: async (context) => {
                const { connectionParams } = context;
                const token = connectionParams?.authorization as string;

                context.extra = await accessTokenService.validateToken(token);
              },
            },
          },
        };
      },
    }),
  ],
})
export class SubscriptionGraphqlApiModule {}
