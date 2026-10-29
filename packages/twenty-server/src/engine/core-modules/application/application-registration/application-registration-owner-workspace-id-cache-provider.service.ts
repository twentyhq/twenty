import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@Injectable()
@CoreEntityCache('applicationRegistrationOwnerWorkspaceId')
export class ApplicationRegistrationOwnerWorkspaceIdCacheProviderService extends CoreEntityCacheProvider<string> {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
  ) {
    super();
  }

  async computeForCache(
    applicationRegistrationId: string,
  ): Promise<string | null> {
    const applicationRegistration =
      await this.applicationRegistrationRepository.findOne({
        select: { id: true, ownerWorkspaceId: true },
        where: { id: applicationRegistrationId },
      });

    return applicationRegistration?.ownerWorkspaceId ?? null;
  }
}
