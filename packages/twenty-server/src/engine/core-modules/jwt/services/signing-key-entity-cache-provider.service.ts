import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';

@Injectable()
@CoreEntityCache('signingKeyPublicKey')
export class SigningKeyEntityCacheProviderService extends CoreEntityCacheProvider<string> {
  constructor(
    @InjectRepository(SigningKeyEntity)
    private readonly signingKeyRepository: Repository<SigningKeyEntity>,
  ) {
    super();
  }

  async computeForCache(entityId: string): Promise<string | null> {
    const signingKey = await this.signingKeyRepository.findOne({
      where: { id: entityId, revokedAt: IsNull() },
    });

    if (!isDefined(signingKey)) {
      return null;
    }

    return signingKey.publicKey;
  }
}
