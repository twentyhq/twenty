import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ConnectionProviderManifest } from 'twenty-shared/application';
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
  // registration variables are populated. Single-provider variant; for the
  // resolver listing path use `areClientCredentialsConfiguredBatch` instead
  // to avoid N+1.
  async areClientCredentialsConfigured(
    provider: ApplicationOAuthProviderEntity,
  ): Promise<boolean> {
    const result = await this.areClientCredentialsConfiguredBatch([provider]);

    return result.get(provider.id) ?? false;
  }

  // Batched variant: for N providers (typically all from one application),
  // does at most 2 DB round-trips total instead of 2N.
  async areClientCredentialsConfiguredBatch(
    providers: ApplicationOAuthProviderEntity[],
  ): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>();

    if (providers.length === 0) {
      return result;
    }

    const applicationIds = [...new Set(providers.map((p) => p.applicationId))];
    const applications = await this.applicationRepository.find({
      where: { id: In(applicationIds) },
    });
    const registrationIdByApplicationId = new Map(
      applications.map((app) => [app.id, app.applicationRegistrationId]),
    );

    const registrationIds = [
      ...new Set(
        applications
          .map((app) => app.applicationRegistrationId)
          .filter(isDefined),
      ),
    ];

    if (registrationIds.length === 0) {
      providers.forEach((p) => result.set(p.id, false));

      return result;
    }

    const allKeys = providers.flatMap((p) => [
      p.clientIdVariable,
      p.clientSecretVariable,
    ]);
    const variables = await this.registrationVariableRepository.find({
      where: {
        applicationRegistrationId: In(registrationIds),
        key: In(allKeys),
      },
    });

    const filledKeysByRegistrationId = new Map<string, Set<string>>();

    for (const variable of variables) {
      if (variable.encryptedValue === '') continue;
      const set =
        filledKeysByRegistrationId.get(variable.applicationRegistrationId) ??
        new Set<string>();

      set.add(variable.key);
      filledKeysByRegistrationId.set(variable.applicationRegistrationId, set);
    }

    for (const provider of providers) {
      const registrationId = registrationIdByApplicationId.get(
        provider.applicationId,
      );

      if (!isDefined(registrationId)) {
        result.set(provider.id, false);
        continue;
      }

      const filled = filledKeysByRegistrationId.get(registrationId);

      result.set(
        provider.id,
        filled?.has(provider.clientIdVariable) === true &&
          filled?.has(provider.clientSecretVariable) === true,
      );
    }

    return result;
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

  // Persists OAuth-typed entries only. Other connection-provider types get
  // their own sibling persistence helpers when added.
  async upsertManyFromManifest({
    connectionProviders,
    applicationId,
    workspaceId,
  }: {
    connectionProviders?: ConnectionProviderManifest[];
    applicationId: string;
    workspaceId: string;
  }): Promise<void> {
    const oauthProviders = (connectionProviders ?? []).filter(
      (provider) => provider.type === 'oauth',
    );

    const existing = await this.oauthProviderRepository.find({
      where: { applicationId, workspaceId },
    });

    if (oauthProviders.length === 0 && existing.length === 0) {
      return;
    }

    const existingByUniversalIdentifier = new Map(
      existing.map((p) => [p.universalIdentifier, p]),
    );

    const toSave: Partial<ApplicationOAuthProviderEntity>[] =
      oauthProviders.map((manifest) => {
        const fields = {
          applicationId,
          workspaceId,
          universalIdentifier: manifest.universalIdentifier,
          name: manifest.name,
          displayName: manifest.displayName,
          icon: manifest.icon ?? null,
          authorizationEndpoint: manifest.oauth.authorizationEndpoint,
          tokenEndpoint: manifest.oauth.tokenEndpoint,
          revokeEndpoint: manifest.oauth.revokeEndpoint ?? null,
          scopes: manifest.oauth.scopes,
          clientIdVariable: manifest.oauth.clientIdVariable,
          clientSecretVariable: manifest.oauth.clientSecretVariable,
          authorizationParams: manifest.oauth.authorizationParams ?? null,
          tokenRequestContentType:
            manifest.oauth.tokenRequestContentType ?? 'json',
          usePkce: manifest.oauth.usePkce ?? true,
        };

        const existingEntity = existingByUniversalIdentifier.get(
          manifest.universalIdentifier,
        );

        return isDefined(existingEntity)
          ? { id: existingEntity.id, ...fields }
          : fields;
      });

    if (toSave.length > 0) {
      await this.oauthProviderRepository.save(toSave);
    }

    await this.oauthProviderRepository.delete(
      oauthProviders.length > 0
        ? {
            applicationId,
            workspaceId,
            universalIdentifier: Not(
              In(oauthProviders.map((p) => p.universalIdentifier)),
            ),
          }
        : { applicationId, workspaceId },
    );
  }
}
