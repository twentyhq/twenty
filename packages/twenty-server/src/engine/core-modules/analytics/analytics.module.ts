/* eslint-disable no-restricted-imports */
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

import { AnalyticsResolver } from './analytics.resolver';
import { AnalyticsService } from './analytics.service';

const TINYBIRD_BASE_URL = 'https://api.eu-central-1.aws.tinybird.co/v0';

const InternalTinybirdJwtModule = NestJwtModule.registerAsync({
  useFactory: async (environmentService: EnvironmentService) => {
    return {
      secret: environmentService.get('TINYBIRD_JWT_TOKEN'),
      signOptions: {
        expiresIn: environmentService.get('TINYBIRD_TOKEN_EXPIRES_IN'),
      },
    };
  },
  inject: [EnvironmentService],
});

@Module({
  providers: [AnalyticsResolver, AnalyticsService],
  imports: [
    HttpModule.register({
      baseURL: TINYBIRD_BASE_URL,
    }),
    InternalTinybirdJwtModule,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
