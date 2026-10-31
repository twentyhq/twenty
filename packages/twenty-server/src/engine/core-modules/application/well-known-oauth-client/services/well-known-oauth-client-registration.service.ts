import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isString } from '@sniptt/guards';
import { Repository } from 'typeorm';

import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { ApplicationRegistrationSeedingService } from 'src/engine/core-modules/application/application-registration/application-registration-seeding/application-registration-seeding.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type WellKnownOAuthClientDefinition } from 'src/engine/core-modules/application/well-known-oauth-client/types/well-known-oauth-client-definition.type';

const DISPLAY_FIELD_NAMES = [
  'name',
  'description',
  'aboutDescription',
  'author',
  'category',
  'websiteUrl',
  'logo',
] as const;

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
        ...toDisplayFields(wellKnownOAuthClient),
        isListed: true,
        universalIdentifier: wellKnownOAuthClient.universalIdentifier,
        oAuthRedirectUris:
          wellKnownOAuthClient.allowedRedirectUris.filter(isString),
        oAuthScopes: [...ALL_OAUTH_SCOPES],
      },
    );
  }

  // Display content ships with the server, so existing registrations are brought up to date on each sync
  async syncRegistration(
    wellKnownOAuthClient: WellKnownOAuthClientDefinition,
  ): Promise<{
    registration: ApplicationRegistrationEntity;
    hasChanged: boolean;
  }> {
    const registration =
      await this.findOrCreateRegistration(wellKnownOAuthClient);
    const displayFields = toDisplayFields(wellKnownOAuthClient);

    const hasChanged =
      !registration.isListed ||
      DISPLAY_FIELD_NAMES.some(
        (fieldName) => registration[fieldName] !== displayFields[fieldName],
      );

    if (hasChanged) {
      await this.applicationRegistrationRepository.update(registration.id, {
        ...displayFields,
        isListed: true,
      });
    }

    return { registration, hasChanged };
  }
}
