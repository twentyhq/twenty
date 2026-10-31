import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export type SeededOAuthOnlyRegistrationValues = Pick<
  ApplicationRegistrationEntity,
  'universalIdentifier' | 'name' | 'oAuthRedirectUris' | 'oAuthScopes'
> &
  QueryDeepPartialEntity<ApplicationRegistrationEntity>;

// Registrations the server itself provides (the Twenty CLI, well-known OAuth clients), created on first use
@Injectable()
export class ApplicationRegistrationSeedingService {
  private readonly logger = new Logger(
    ApplicationRegistrationSeedingService.name,
  );

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly applicationRegistrationLookupService: ApplicationRegistrationLookupService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async findOrCreateOAuthOnlyRegistration(
    values: SeededOAuthOnlyRegistrationValues,
  ): Promise<ApplicationRegistrationEntity> {
    const existingRegistration =
      await this.applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal(
        values.universalIdentifier,
      );

    if (isDefined(existingRegistration)) {
      // A row created by someone else under this identifier must not be served as the server's own
      if (
        existingRegistration.sourceType !==
          ApplicationRegistrationSourceType.OAUTH_ONLY ||
        isDefined(existingRegistration.ownerWorkspaceId) ||
        isDefined(existingRegistration.oAuthClientSecretHash)
      ) {
        throw new ApplicationException(
          `The ${values.name} application registration is taken by another owner`,
          ApplicationExceptionCode.APPLICATION_NOT_FOUND,
        );
      }

      return existingRegistration;
    }

    const insertResult = await this.applicationRegistrationRepository
      .createQueryBuilder()
      .insert()
      .into(ApplicationRegistrationEntity)
      .values({
        ...values,
        oAuthClientId: v4(),
        oAuthClientSecretHash: null,
        ownerWorkspaceId: null,
        createdByUserId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      })
      .orIgnore()
      .returning('id')
      .execute();

    if (insertResult.raw.length > 0) {
      await this.invalidateMarketplaceCatalog();
    }

    const registration =
      await this.applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal(
        values.universalIdentifier,
      );

    if (!isDefined(registration)) {
      throw new ApplicationException(
        `Failed to create the ${values.name} application registration`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return registration;
  }

  async invalidateMarketplaceCatalog(): Promise<void> {
    try {
      await this.coreEntityCacheService.invalidate(
        'marketplaceCatalog',
        MARKETPLACE_CATALOG_CACHE_ENTITY_ID,
      );
    } catch (error) {
      this.logger.error('Failed to invalidate marketplace apps cache', error);
    }
  }
}
