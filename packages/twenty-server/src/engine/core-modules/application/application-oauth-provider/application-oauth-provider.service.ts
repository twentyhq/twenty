import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type OAuthProviderManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';

import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { ApplicationOAuthProviderExceptionCode } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-exception-code.enum';
import { ApplicationOAuthProviderException } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.exception';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

@Injectable()
export class ApplicationOAuthProviderService {
  constructor(
    @InjectRepository(ApplicationOAuthProviderEntity)
    private readonly oauthProviderRepository: Repository<ApplicationOAuthProviderEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly registrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  // OAuth client_id/client_secret are properties of the OAuth app registered
  // at the provider (one Linear app per Twenty server, etc.) — not per-tenant
  // settings — so they live in applicationRegistrationVariable, set once by
  // the server admin. All workspaces installing this app share them.
  async getClientCredentials(
    provider: ApplicationOAuthProviderEntity,
  ): Promise<{ clientId: string; clientSecret: string }> {
    const application = await this.applicationRepository.findOneBy({
      id: provider.applicationId,
    });

    if (!isDefined(application?.applicationRegistrationId)) {
      throw new ApplicationOAuthProviderException(
        `Application ${provider.applicationId} has no registration; OAuth client credentials cannot be resolved`,
        ApplicationOAuthProviderExceptionCode.CLIENT_CREDENTIALS_NOT_CONFIGURED,
      );
    }

    const variables = await this.registrationVariableRepository.find({
      where: {
        applicationRegistrationId: application.applicationRegistrationId,
        key: In([provider.clientIdVariable, provider.clientSecretVariable]),
      },
    });

    const valuesByKey = new Map(
      variables.map((v) => [
        v.key,
        v.encryptedValue
          ? this.secretEncryptionService.decrypt(v.encryptedValue)
          : '',
      ]),
    );

    const clientId = valuesByKey.get(provider.clientIdVariable) ?? '';
    const clientSecret = valuesByKey.get(provider.clientSecretVariable) ?? '';

    if (!clientId || !clientSecret) {
      throw new ApplicationOAuthProviderException(
        `OAuth client credentials are not configured for provider "${provider.name}". The server administrator needs to fill in "${provider.clientIdVariable}" and "${provider.clientSecretVariable}" on the application registration.`,
        ApplicationOAuthProviderExceptionCode.CLIENT_CREDENTIALS_NOT_CONFIGURED,
      );
    }

    return { clientId, clientSecret };
  }

  // Cheap check used by the GraphQL resolver to surface a "needs setup" hint
  // to non-admin users. Doesn't decrypt — just looks at whether the
  // registration variables are populated.
  async areClientCredentialsConfigured(
    provider: ApplicationOAuthProviderEntity,
  ): Promise<boolean> {
    const application = await this.applicationRepository.findOneBy({
      id: provider.applicationId,
    });

    if (!isDefined(application?.applicationRegistrationId)) {
      return false;
    }

    const variables = await this.registrationVariableRepository.find({
      where: {
        applicationRegistrationId: application.applicationRegistrationId,
        key: In([provider.clientIdVariable, provider.clientSecretVariable]),
      },
    });

    return (
      variables.length === 2 && variables.every((v) => v.encryptedValue !== '')
    );
  }

  async findOneByApplicationAndName({
    applicationId,
    name,
  }: {
    applicationId: string;
    name: string;
  }): Promise<ApplicationOAuthProviderEntity | null> {
    return this.oauthProviderRepository.findOne({
      where: { applicationId, name },
    });
  }

  async findOneByIdOrThrow(
    id: string,
  ): Promise<ApplicationOAuthProviderEntity> {
    const provider = await this.oauthProviderRepository.findOne({
      where: { id },
    });

    if (!isDefined(provider)) {
      throw new ApplicationOAuthProviderException(
        `OAuth provider with id "${id}" not found`,
        ApplicationOAuthProviderExceptionCode.PROVIDER_NOT_FOUND,
      );
    }

    return provider;
  }

  async findManyByApplication({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<ApplicationOAuthProviderEntity[]> {
    return this.oauthProviderRepository.find({
      where: { applicationId, workspaceId },
    });
  }

  async upsertManyFromManifest({
    oauthProviders,
    applicationId,
    workspaceId,
  }: {
    oauthProviders?: OAuthProviderManifest[];
    applicationId: string;
    workspaceId: string;
  }): Promise<void> {
    const providers = oauthProviders ?? [];

    const existing = await this.oauthProviderRepository.find({
      where: { applicationId, workspaceId },
    });

    if (providers.length === 0 && existing.length === 0) {
      return;
    }

    const existingByUniversalIdentifier = new Map(
      existing.map((p) => [p.universalIdentifier, p]),
    );

    const toSave: Partial<ApplicationOAuthProviderEntity>[] = providers.map(
      (manifest) => {
        const fields = {
          applicationId,
          workspaceId,
          universalIdentifier: manifest.universalIdentifier,
          name: manifest.name,
          displayName: manifest.displayName,
          icon: manifest.icon ?? null,
          authorizationEndpoint: manifest.authorizationEndpoint,
          tokenEndpoint: manifest.tokenEndpoint,
          revokeEndpoint: manifest.revokeEndpoint ?? null,
          scopes: manifest.scopes,
          clientIdVariable: manifest.clientIdVariable,
          clientSecretVariable: manifest.clientSecretVariable,
          authorizationParams: manifest.authorizationParams ?? null,
          tokenRequestContentType: manifest.tokenRequestContentType ?? 'json',
          usePkce: manifest.usePkce ?? true,
        };

        const existingEntity = existingByUniversalIdentifier.get(
          manifest.universalIdentifier,
        );

        return isDefined(existingEntity)
          ? { id: existingEntity.id, ...fields }
          : fields;
      },
    );

    if (toSave.length > 0) {
      await this.oauthProviderRepository.save(toSave);
    }

    await this.oauthProviderRepository.delete(
      providers.length > 0
        ? {
            applicationId,
            universalIdentifier: Not(
              In(providers.map((p) => p.universalIdentifier)),
            ),
          }
        : { applicationId },
    );
  }
}
