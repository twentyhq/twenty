import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { type FlatUser } from 'src/engine/core-modules/user/types/flat-user.type';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Injectable()
@CoreEntityCache('user')
export class UserEntityCacheProviderService extends CoreEntityCacheProvider<FlatUser> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super();
  }

  async computeForCache(entityId: string): Promise<FlatUser | null> {
    const entity = await this.userRepository.findOne({
      where: { id: entityId },
    });

    if (entity === null) {
      return null;
    }

    return fromUserEntityToFlat(entity);
  }
}
