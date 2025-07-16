import { Inject, Injectable } from '@nestjs/common';

import { KEY_WRAPPING_STRATEGY } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.constants';
import { KeyWrappingStrategyInterface } from 'src/engine/core-modules/encryption/keys/wrapping/strategies/interface/key-wrapping-strategy.interface';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';

@Injectable()
export class KeyWrappingService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    @Inject(KEY_WRAPPING_STRATEGY)
    private readonly wrappingStrategy: KeyWrappingStrategyInterface,
  ) {}

  async wrapKey(
    keyToWrap: Buffer,
    purpose: string,
  ): Promise<{
    wrappedKey: string;
  }> {
    const keyEncryptionKey = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.KEY_ENCRYPTION_KEY,
      purpose,
    );

    const wrappedKey = await this.wrappingStrategy.wrap(
      keyToWrap,
      Buffer.from(keyEncryptionKey, 'hex'),
    );

    return {
      wrappedKey: wrappedKey.toString('hex'),
    };
  }

  async unwrapKey(
    wrappedKey: Buffer,
    purpose: string,
  ): Promise<{
    unwrappedKey: string;
  }> {
    const keyEncryptionKey = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.KEY_ENCRYPTION_KEY,
      purpose,
    );

    const unwrappedKey = await this.wrappingStrategy.unwrap(
      wrappedKey,
      Buffer.from(keyEncryptionKey, 'hex'),
    );

    return {
      unwrappedKey: unwrappedKey.toString('hex'),
    };
  }
}
