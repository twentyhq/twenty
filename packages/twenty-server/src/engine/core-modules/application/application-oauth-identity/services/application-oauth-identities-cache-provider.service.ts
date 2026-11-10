import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { type ApplicationOAuthIdentityRegistration } from 'src/engine/core-modules/application/application-oauth-identity/types/application-oauth-identity-registration.type';
import { getApplicationOAuthIdentity } from 'src/engine/core-modules/application/application-oauth-identity/utils/get-application-oauth-identity.util';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

@Injectable()
@CoreEntityCache('applicationOAuthIdentities')
export class ApplicationOAuthIdentitiesCacheProviderService extends CoreEntityCacheProvider<
  ApplicationOAuthIdentityRegistration[]
> {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
  ) {
    super();
  }

  async computeForCache(): Promise<ApplicationOAuthIdentityRegistration[]> {
    const registrations = await this.applicationRegistrationRepository
      .createQueryBuilder('applicationRegistration')
      .select([
        'applicationRegistration.id',
        'applicationRegistration.universalIdentifier',
        'applicationRegistration.name',
        'applicationRegistration.sourceType',
        'applicationRegistration.sourcePackage',
        'applicationRegistration.manifest',
      ])
      .where('applicationRegistration.sourceType = :sourceType', {
        sourceType: ApplicationRegistrationSourceType.NPM,
      })
      .andWhere(
        `applicationRegistration.manifest -> 'application' -> 'oAuthIdentity' IS NOT NULL`,
      )
      .orderBy('applicationRegistration.createdAt', 'ASC')
      .getMany();

    return registrations.flatMap((registration) => {
      const oAuthIdentity = getApplicationOAuthIdentity(registration);

      return isDefined(oAuthIdentity)
        ? [
            {
              applicationRegistrationId: registration.id,
              universalIdentifier: registration.universalIdentifier,
              name: registration.name,
              oAuthIdentity,
            },
          ]
        : [];
    });
  }
}
