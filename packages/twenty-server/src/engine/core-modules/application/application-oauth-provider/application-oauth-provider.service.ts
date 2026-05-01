import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type OAuthProviderManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { In, Not, Repository } from 'typeorm';

import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { ApplicationOAuthProviderExceptionCode } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-exception-code.enum';
import { ApplicationOAuthProviderException } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.exception';

@Injectable()
export class ApplicationOAuthProviderService {
  constructor(
    @InjectRepository(ApplicationOAuthProviderEntity)
    private readonly oauthProviderRepository: Repository<ApplicationOAuthProviderEntity>,
  ) {}

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

  async findOneById(
    id: string,
  ): Promise<ApplicationOAuthProviderEntity | null> {
    return this.oauthProviderRepository.findOne({ where: { id } });
  }

  async findOneByIdOrThrow(
    id: string,
  ): Promise<ApplicationOAuthProviderEntity> {
    const provider = await this.findOneById(id);

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
          connectionMode: manifest.connectionMode,
          clientIdVariable: manifest.clientIdVariable,
          clientSecretVariable: manifest.clientSecretVariable,
          accessTokenExpiresInMs: manifest.accessTokenExpiresInMs ?? null,
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

  async deleteByApplication(applicationId: string): Promise<void> {
    await this.oauthProviderRepository.delete({ applicationId });
  }
}
