import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Issuer, type StrategyOptions } from 'openid-client';
import { Repository } from 'typeorm';

import { OidcIdentityProviderEntity } from '../oidc/oidc-auth.entity';
import { SamlIdentityProviderEntity } from '../saml/saml-auth.entity';
import { SSOType, WorkspaceSSOEntity } from '../workspace-sso.entity';
import { type SSOConfiguration } from '../types/SSOConfigurations.type';

@Injectable()
export class SSOService {
  constructor(
    @InjectRepository(WorkspaceSSOEntity)
    private readonly workspaceSsoRepository: Repository<WorkspaceSSOEntity>,
    @InjectRepository(SamlIdentityProviderEntity)
    private readonly samlRepository: Repository<SamlIdentityProviderEntity>,
    @InjectRepository(OidcIdentityProviderEntity)
    private readonly oidcRepository: Repository<OidcIdentityProviderEntity>,
  ) {}

  async findSSOIdentityProviderById(
    id: string,
  ): Promise<(SSOConfiguration & WorkspaceSSOEntity) | null> {
    const workspaceIdentityProvider = await this.workspaceSsoRepository.findOne({
      where: { id },
      relations: { workspace: true },
    });

    if (!workspaceIdentityProvider) return null;

    if (workspaceIdentityProvider.type === SSOType.SAML) {
      const provider = workspaceIdentityProvider.samlProviderId
        ? await this.samlRepository.findOne({
            where: { id: workspaceIdentityProvider.samlProviderId },
            relations: { workspace: true },
          })
        : null;

      if (!provider) return this.toConfiguration(workspaceIdentityProvider);

      return {
        ...this.toConfiguration(workspaceIdentityProvider),
        ...provider,
        name: provider.name,
        issuer: provider.issuer,
        ssoURL: provider.entryPointUrl,
      };
    }

    const provider = workspaceIdentityProvider.oidcProviderId
      ? await this.oidcRepository.findOne({
          where: { id: workspaceIdentityProvider.oidcProviderId },
          relations: { workspace: true },
        })
      : null;

    if (!provider) return this.toConfiguration(workspaceIdentityProvider);

    return {
      ...this.toConfiguration(workspaceIdentityProvider),
      ...provider,
      name: provider.name,
      issuer: provider.issuerUrl,
      callbackUrl: this.buildCallbackUrl(workspaceIdentityProvider),
    };
  }

  isSAMLIdentityProvider(
    identityProvider: SSOConfiguration & WorkspaceSSOEntity,
  ): identityProvider is SSOConfiguration & WorkspaceSSOEntity & { type: SSOType.SAML } {
    return identityProvider.type === SSOType.SAML;
  }

  buildIssuerURL(identityProvider: Pick<WorkspaceSSOEntity, 'id' | 'type'>): string {
    return `${this.getBaseUrl()}/auth/${identityProvider.type}/${identityProvider.id}`;
  }

  buildCallbackUrl(identityProvider: Pick<WorkspaceSSOEntity, 'id' | 'type'>): string {
    if (identityProvider.type === SSOType.SAML) {
      return `${this.getBaseUrl()}/auth/saml/callback/${identityProvider.id}`;
    }

    return `${this.getBaseUrl()}/auth/oidc/callback`;
  }

  async getAuthorizationUrlForSSO(
    identityProviderId: string,
    _params: Record<string, unknown>,
  ): Promise<{
    authorizationURL: string;
    type: SSOType;
    id: string;
  }> {
    const identityProvider = await this.findSSOIdentityProviderById(identityProviderId);

    if (!identityProvider) {
      throw new Error('Identity provider not found');
    }

    return {
      authorizationURL: this.buildLoginUrl(identityProvider),
      type: identityProvider.type,
      id: identityProvider.id,
    };
  }

  getOIDCClient(
    identityProvider: SSOConfiguration & WorkspaceSSOEntity,
    issuer: Issuer,
  ): StrategyOptions['client'] {
    const callbackUrl = this.buildCallbackUrl(identityProvider);

    return new issuer.Client({
      client_id: identityProvider.clientId ?? '',
      client_secret: identityProvider.clientSecret ?? '',
      redirect_uris: [callbackUrl],
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_basic',
    }) as StrategyOptions['client'];
  }

  private toConfiguration(
    identityProvider: WorkspaceSSOEntity,
  ): SSOConfiguration & WorkspaceSSOEntity {
    return {
      ...identityProvider,
      issuer: identityProvider.issuer ?? this.buildIssuerURL(identityProvider),
      callbackUrl: this.buildCallbackUrl(identityProvider),
    };
  }

  private buildLoginUrl(identityProvider: Pick<WorkspaceSSOEntity, 'id' | 'type'>): string {
    return `${this.getBaseUrl()}/auth/${identityProvider.type}/login/${identityProvider.id}`;
  }

  private getBaseUrl(): string {
    return process.env.APP_URL ?? process.env.CLIENT_URL ?? 'http://localhost:3000';
  }
}
