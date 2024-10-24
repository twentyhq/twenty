/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

const InternalJwtModule = NestJwtModule.registerAsync({
  useFactory: async (environmentService: EnvironmentService) => {
    return {
      secret: environmentService.get('APP_SECRET'),
      signOptions: {
        expiresIn: environmentService.get('ACCESS_TOKEN_EXPIRES_IN'),
      },
    };
  },
  inject: [EnvironmentService],
});

@Module({
  imports: [InternalJwtModule, EnvironmentModule],
  controllers: [],
  providers: [JwtWrapperService],
  exports: [JwtWrapperService],
})
export class JwtModule {}
