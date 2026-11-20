import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { type FlatApplicationAuthorization } from 'src/engine/core-modules/application/application-authorization/types/flat-application-authorization.type';

@Injectable()
@CoreEntityCache('applicationAuthorization')
export class ApplicationAuthorizationEntityCacheProviderService extends CoreEntityCacheProvider<FlatApplicationAuthorization> {
  constructor(
    @InjectRepository(ApplicationAuthorizationEntity)
    private readonly applicationAuthorizationRepository: Repository<ApplicationAuthorizationEntity>,
  ) {
    super();
  }

  async computeForCache(
    entityId: string,
  ): Promise<FlatApplicationAuthorization | null> {
    const entity = await this.applicationAuthorizationRepository.findOne({
      where: { id: entityId },
      select: { id: true, lastAuthorizedAt: true, revokedAt: true },
    });

    if (!isDefined(entity)) {
      return null;
    }

    return {
      id: entity.id,
      lastAuthorizedAt: entity.lastAuthorizedAt?.toISOString() ?? null,
      revokedAt: entity.revokedAt?.toISOString() ?? null,
    };
  }
}
