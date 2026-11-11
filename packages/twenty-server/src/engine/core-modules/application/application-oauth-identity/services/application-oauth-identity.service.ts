import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';
import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/utils/is-client-id-metadata-document-url.util';
import { APPLICATION_OAUTH_IDENTITIES_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-oauth-identity/constants/application-oauth-identities-cache-entity-id.constant';
import { type ApplicationOAuthIdentityRegistration } from 'src/engine/core-modules/application/application-oauth-identity/types/application-oauth-identity-registration.type';
import { findOAuthIdentityRegistrationByRedirectUris } from 'src/engine/core-modules/application/application-oauth-identity/utils/find-oauth-identity-registration-by-redirect-uris.util';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

@Injectable()
export class ApplicationOAuthIdentityService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  // Codes only reach registered callbacks, so only a client whose every callback is the app's can be that app
  async findRegistrationByRedirectUris(
    redirectUris: string[],
  ): Promise<ApplicationRegistrationEntity | null> {
    return this.findRegistration(
      findOAuthIdentityRegistrationByRedirectUris({
        identityRegistrations: await this.findAll(),
        redirectUris,
      }),
    );
  }

  async findRegistrationByClientIdMetadataDocument(
    clientIdMetadataDocument: Pick<
      ClientIdMetadataDocument,
      'clientId' | 'redirectUris'
    >,
  ): Promise<ApplicationRegistrationEntity | null> {
    const identityRegistration = findOAuthIdentityRegistrationByRedirectUris({
      identityRegistrations: await this.findAll(),
      redirectUris: clientIdMetadataDocument.redirectUris,
    });
    const clientIdHostname = new URL(clientIdMetadataDocument.clientId)
      .hostname;

    return identityRegistration?.oAuthIdentity.clientIdMetadataDocumentHostnames?.includes(
      clientIdHostname,
    )
      ? this.findRegistration(identityRegistration)
      : null;
  }

  async isVerifiedClientName(name: string): Promise<boolean> {
    const normalizedName = name.trim().toLowerCase();

    return (await this.findAll()).some(
      (identityRegistration) =>
        identityRegistration.name.trim().toLowerCase() === normalizedName,
    );
  }

  // Each connection used to register its own client; those still belong to the app they connected
  async findOAuthIdentityUniversalIdentifier(
    registration:
      | Pick<
          ApplicationRegistrationEntity,
          | 'id'
          | 'universalIdentifier'
          | 'sourceType'
          | 'ownerWorkspaceId'
          | 'oAuthClientId'
          | 'oAuthRedirectUris'
        >
      | null
      | undefined,
  ): Promise<string | null> {
    if (!isDefined(registration)) {
      return null;
    }

    const identityRegistrations = await this.findAll();

    if (
      identityRegistrations.some(
        ({ applicationRegistrationId }) =>
          applicationRegistrationId === registration.id,
      )
    ) {
      return registration.universalIdentifier;
    }

    if (
      registration.sourceType !==
        ApplicationRegistrationSourceType.OAUTH_ONLY ||
      isDefined(registration.ownerWorkspaceId)
    ) {
      return null;
    }

    const identityRegistration = findOAuthIdentityRegistrationByRedirectUris({
      identityRegistrations,
      redirectUris: registration.oAuthRedirectUris,
    });

    if (isValidUuid(registration.oAuthClientId)) {
      return identityRegistration?.universalIdentifier ?? null;
    }

    // A document's host controls its callbacks, so it needs the same hostname check as a fresh connection
    if (!isClientIdMetadataDocumentUrl(registration.oAuthClientId)) {
      return null;
    }

    return identityRegistration?.oAuthIdentity.clientIdMetadataDocumentHostnames?.includes(
      new URL(registration.oAuthClientId).hostname,
    )
      ? identityRegistration.universalIdentifier
      : null;
  }

  private async findAll(): Promise<ApplicationOAuthIdentityRegistration[]> {
    return (
      (await this.coreEntityCacheService.get(
        'applicationOAuthIdentities',
        APPLICATION_OAUTH_IDENTITIES_CACHE_ENTITY_ID,
      )) ?? []
    );
  }

  private async findRegistration(
    identityRegistration: ApplicationOAuthIdentityRegistration | undefined,
  ): Promise<ApplicationRegistrationEntity | null> {
    if (!isDefined(identityRegistration)) {
      return null;
    }

    return this.applicationRegistrationRepository.findOne({
      where: { id: identityRegistration.applicationRegistrationId },
    });
  }
}
