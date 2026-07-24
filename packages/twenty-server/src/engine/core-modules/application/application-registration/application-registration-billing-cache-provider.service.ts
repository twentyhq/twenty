import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@Injectable()
@CoreEntityCache('applicationRegistrationHasFreeLogicFunctionExecutions')
export class ApplicationRegistrationBillingCacheProviderService extends CoreEntityCacheProvider<boolean> {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
  ) {
    super();
  }

  async computeForCache(entityId: string): Promise<boolean | null> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { id: entityId },
      select: { id: true, hasFreeLogicFunctionExecutions: true },
    });

    if (!isDefined(registration)) {
      return null;
    }

    return registration.hasFreeLogicFunctionExecutions;
  }
}
