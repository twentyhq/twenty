import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { JwtPublicKeyEntity } from 'src/engine/core-modules/jwt/entities/jwt-public-key.entity';
import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { JwtPublicKeyEntityCacheProviderService } from 'src/engine/core-modules/jwt/services/jwt-public-key-entity-cache-provider.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const InternalJwtModule = NestJwtModule.registerAsync({
  useFactory: async (twentyConfigService: TwentyConfigService) => {
    return {
      secret: twentyConfigService.get('APP_SECRET'),
      signOptions: {
        algorithm: 'HS256',
        expiresIn: twentyConfigService.get('ACCESS_TOKEN_EXPIRES_IN'),
      },
      verifyOptions: {
        algorithms: ['HS256', 'ES256'],
      },
    };
  },
  inject: [TwentyConfigService],
});

@Module({
  imports: [
    InternalJwtModule,
    TwentyConfigModule,
    TypeOrmModule.forFeature([JwtPublicKeyEntity]),
    CoreEntityCacheModule,
  ],
  controllers: [],
  providers: [
    JwtWrapperService,
    JwtKeyManagerService,
    JwtPublicKeyEntityCacheProviderService,
  ],
  exports: [JwtWrapperService, JwtKeyManagerService],
})
export class JwtModule {}
