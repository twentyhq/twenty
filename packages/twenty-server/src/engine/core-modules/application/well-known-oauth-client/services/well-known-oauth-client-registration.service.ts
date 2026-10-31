import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type WellKnownOAuthClientDefinition } from 'src/engine/core-modules/application/well-known-oauth-client/types/well-known-oauth-client-definition.type';

const toDisplayFields = (
  wellKnownOAuthClient: WellKnownOAuthClientDefinition,
) => ({
  name: wellKnownOAuthClient.name,
  description: wellKnownOAuthClient.description,
  aboutDescription: wellKnownOAuthClient.aboutDescription,
  author: wellKnownOAuthClient.author,
  category: wellKnownOAuthClient.category,
  websiteUrl: wellKnownOAuthClient.websiteUrl,
  logo: wellKnownOAuthClient.logo,
  isListed: true,
});

// One OAuth-only registration per well-known client, shared by every connection
// on this server, so each workspace installs it once
@Injectable()
export class WellKnownOAuthClientRegistrationService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly applicationRegistrationLookupService: ApplicationRegistrationLookupService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async findOrCreateRegistration(
    wellKnownOAuthClient: WellKnownOAuthClientDefinition,
  ): Promise<ApplicationRegistrationEntity> {
    const existingRegistration =
      await this.applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal(
        wellKnownOAuthClient.universalIdentifier,
      );

    if (isDefined(existingRegistration)) {
      return existingRegistration;
    }

    const insertResult = await this.applicationRegistrationRepository
      .createQueryBuilder()
      .insert()
      .into(ApplicationRegistrationEntity)
      .values({
        ...toDisplayFields(wellKnownOAuthClient),
        universalIdentifier: wellKnownOAuthClient.universalIdentifier,
        oAuthClientId: v4(),
        oAuthClientSecretHash: null,
        oAuthRedirectUris:
          wellKnownOAuthClient.allowedRedirectUris.filter(isString),
        oAuthScopes: [...ALL_OAUTH_SCOPES],
        ownerWorkspaceId: null,
        createdByUserId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      })
      .orIgnore()
      .returning('id')
      .execute();

    // Seeded registrations are listed, so the marketplace must pick up one created between catalog syncs
    if (insertResult.raw.length > 0) {
      await this.coreEntityCacheService.invalidate(
        'marketplaceCatalog',
        MARKETPLACE_CATALOG_CACHE_ENTITY_ID,
      );
    }

    const registration =
      await this.applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal(
        wellKnownOAuthClient.universalIdentifier,
      );

    if (!isDefined(registration)) {
      throw new ApplicationException(
        `Failed to create the ${wellKnownOAuthClient.name} application registration`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return registration;
  }

  // Display content ships with the server, so existing registrations are brought up to date on each sync
  async syncRegistration(
    wellKnownOAuthClient: WellKnownOAuthClientDefinition,
  ): Promise<ApplicationRegistrationEntity> {
    const registration =
      await this.findOrCreateRegistration(wellKnownOAuthClient);

    await this.applicationRegistrationRepository.update(
      registration.id,
      toDisplayFields(wellKnownOAuthClient),
    );

    return registration;
  }
}
