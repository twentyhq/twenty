import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { JwtPublicKeyEntity } from 'src/engine/core-modules/jwt/entities/jwt-public-key.entity';

@Injectable()
@CoreEntityCache('jwtPublicKey')
export class JwtPublicKeyEntityCacheProviderService extends CoreEntityCacheProvider<string> {
  constructor(
    @InjectRepository(JwtPublicKeyEntity)
    private readonly jwtPublicKeyRepository: Repository<JwtPublicKeyEntity>,
  ) {
    super();
  }

  async computeForCache(kid: string): Promise<string | null> {
    const row = await this.jwtPublicKeyRepository.findOne({
      where: { kid, revokedAt: IsNull() },
    });

    if (row === null) {
      return null;
    }

    return row.publicKey;
  }
}
