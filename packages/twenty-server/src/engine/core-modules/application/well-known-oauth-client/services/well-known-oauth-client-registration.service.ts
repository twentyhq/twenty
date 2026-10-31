import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isString } from '@sniptt/guards';
import isEqual from 'lodash.isequal';
import { Repository } from 'typeorm';

import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { ApplicationRegistrationSeedingService } from 'src/engine/core-modules/application/application-registration/application-registration-seeding/application-registration-seeding.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type WellKnownOAuthClientDefinition } from 'src/engine/core-modules/application/well-known-oauth-client/types/well-known-oauth-client-definition.type';

// What the server owns on the seeded row, refreshed on each catalog sync
const toSyncedFields = (
  wellKnownOAuthClient: WellKnownOAuthClientDefinition,
) => ({
  name: wellKnownOAuthClient.name,
  description: wellKnownOAuthClient.description,
  aboutDescription: wellKnownOAuthClient.aboutDescription,
  author: wellKnownOAuthClient.author,
  category: wellKnownOAuthClient.category,
  websiteUrl: wellKnownOAuthClient.websiteUrl,
  logo: wellKnownOAuthClient.logo,
  oAuthScopes: [...ALL_OAUTH_SCOPES],
  isListed: true,
});

// One OAuth-only registration per well-known client, shared by every connection
// on this server, so each workspace installs it once
@Injectable()
export class WellKnownOAuthClientRegistrationService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly applicationRegistrationSeedingService: ApplicationRegistrationSeedingService,
  ) {}

  async findOrCreateRegistration(
    wellKnownOAuthClient: WellKnownOAuthClientDefinition,
  ): Promise<ApplicationRegistrationEntity> {
    return this.applicationRegistrationSeedingService.findOrCreateOAuthOnlyRegistration(
      {
        ...toSyncedFields(wellKnownOAuthClient),
        universalIdentifier: wellKnownOAuthClient.universalIdentifier,
        oAuthRedirectUris:
          wellKnownOAuthClient.allowedRedirectUris.filter(isString),
      },
    );
  }

  async syncRegistration(
    wellKnownOAuthClient: WellKnownOAuthClientDefinition,
  ): Promise<{
    registration: ApplicationRegistrationEntity;
    hasChanged: boolean;
  }> {
    const registration =
      await this.findOrCreateRegistration(wellKnownOAuthClient);
    const syncedFields = toSyncedFields(wellKnownOAuthClient);

    const hasChanged = Object.entries(syncedFields).some(
      ([fieldName, value]) =>
        !isEqual(registration[fieldName as keyof typeof syncedFields], value),
    );

    if (hasChanged) {
      await this.applicationRegistrationRepository.update(
        registration.id,
        syncedFields,
      );
    }

    return { registration, hasChanged };
  }
}
