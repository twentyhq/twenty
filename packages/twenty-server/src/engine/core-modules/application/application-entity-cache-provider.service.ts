import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { Injectable } from '@nestjs/common';
import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { fromApplicationEntityToFlatApplication } from 'src/engine/core-modules/application/utils/from-application-entity-to-flat-application.util';

@Injectable()
@CoreEntityCache('applicationEntity')
export class ApplicationEntityCacheProviderService extends CoreEntityCacheProvider<FlatApplication> {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super();
  }

  async computeForCache(entityId: string): Promise<FlatApplication | null> {
    const entity = await this.applicationRepository.findOne({
      where: { id: entityId },
    });

    if (entity === null) {
      return null;
    }

    return fromApplicationEntityToFlatApplication(entity);
  }
}
