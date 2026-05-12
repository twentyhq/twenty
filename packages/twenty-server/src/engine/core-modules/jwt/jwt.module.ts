import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import {
  JWT_LEGACY_ALGORITHM,
  JWT_SUPPORTED_VERIFY_ALGORITHMS,
} from 'src/engine/core-modules/jwt/constants/jwt-algorithm.constant';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SigningKeyEntityCacheProviderService } from 'src/engine/core-modules/jwt/services/signing-key-entity-cache-provider.service';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const InternalJwtModule = NestJwtModule.registerAsync({
  useFactory: async (twentyConfigService: TwentyConfigService) => {
    return {
      secret: twentyConfigService.get('APP_SECRET'),
      signOptions: {
        algorithm: JWT_LEGACY_ALGORITHM,
        expiresIn: twentyConfigService.get('ACCESS_TOKEN_EXPIRES_IN'),
      },
      verifyOptions: {
        algorithms: [...JWT_SUPPORTED_VERIFY_ALGORITHMS],
      },
    };
  },
  inject: [TwentyConfigService],
});

@Module({
  imports: [
    InternalJwtModule,
    TwentyConfigModule,
    TypeOrmModule.forFeature([SigningKeyEntity]),
    CoreEntityCacheModule,
    SecretEncryptionModule,
  ],
  controllers: [],
  providers: [
    JwtWrapperService,
    JwtKeyManagerService,
    SigningKeyEntityCacheProviderService,
  ],
  exports: [JwtWrapperService, JwtKeyManagerService],
})
export class JwtModule {}
