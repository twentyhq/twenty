import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { RefreshToken } from './refresh-token.entity';
import { refreshTokenAutoResolverOpts } from './refresh-token.auto-resolver-opts';

import { RefreshTokenService } from './services/refresh-token.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([RefreshToken], 'core')],
      services: [RefreshTokenService],
      resolvers: refreshTokenAutoResolverOpts,
    }),
  ],
})
export class RefreshTokenModule {}
