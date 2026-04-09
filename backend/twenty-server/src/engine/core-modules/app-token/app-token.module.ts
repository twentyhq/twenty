import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { appTokenAutoResolverOpts } from 'src/engine/core-modules/app-token/app-token.auto-resolver-opts';
import { AppTokenService } from 'src/engine/core-modules/app-token/services/app-token.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([AppTokenEntity])],
      services: [AppTokenService],
      resolvers: appTokenAutoResolverOpts,
    }),
  ],
})
export class AppTokenModule {}
