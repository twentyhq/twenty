/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { custom, Issuer } from 'openid-client';
import { Repository } from 'typeorm';

import {
  WorkspaceSsoIdentityProviderEntity,
  IdentityProviderType,
  OidcResponseType,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import {
  SsoException,
  SsoExceptionCode,
} from 'src/engine/core-modules/sso/sso.exception';
import {
  type OidcConfiguration,
  type SamlConfiguration,
  type SsoConfiguration,
} from 'src/engine/core-modules/sso/types/sso-configurations.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class SsoService {
  private readonly featureLookUpKey = BillingEntitlementKey.SSO;

  // openid-client resolves this hook on whichever object issues the request:
  // the Issuer class for discovery, the issuer instance for JWKS and the
  // client instance for token and userinfo calls, so it is set on all three.
  private readonly oidcHttpOptions = (url: URL) => ({
    agent: this.secureHttpClientService.getSsrfSafeAgent(url),
  });

  constructor(
    @InjectRepository(WorkspaceSsoIdentityProviderEntity)
    private readonly workspaceSsoIdentityProviderRepository: Repository<WorkspaceSsoIdentityProviderEntity>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingService: BillingService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {
    Issuer[custom.http_options] = this.oidcHttpOptions;
  }

  private async isSsoEnabled(workspaceId: string) {
    const isSsoBillingEnabled = await this.billingService.hasEntitlement(
      workspaceId,
      this.featureLookUpKey,
    );

    if (!isSsoBillingEnabled) {
      throw new SsoException(
        `No entitlement found for this workspace`,
        SsoExceptionCode.SSO_DISABLE,
      );
    }
  }

  private async getIssuerForOidc(issuerUrl: string) {
    try {
      return await Issuer.discover(issuerUrl);
    } catch (error) {
      // Surfaced so a blocked private-network issuer is diagnosable at setup;
      // at login the failure would only show as a redirect.
      const reason = error instanceof Error ? error.message : String(error);

      throw new SsoException(
        `Invalid issuer: ${reason}`,
        SsoExceptionCode.INVALID_ISSUER_URL,
        { userFriendlyMessage: msg`Invalid issuer URL: ${reason}` },
      );
    }
  }

  async createOidcIdentityProvider(
    data: Pick<
      WorkspaceSsoIdentityProviderEntity,
      'issuer' | 'clientID' | 'clientSecret' | 'name'
    >,
    workspaceId: string,
  ) {
    try {
      await this.isSsoEnabled(workspaceId);

      const issuer = await this.getIssuerForOidc(data.issuer);

      const identityProvider =
        await this.workspaceSsoIdentityProviderRepository.save({
          type: IdentityProviderType.OIDC,
          clientID: data.clientID,
          clientSecret: data.clientSecret,
          issuer: issuer.metadata.issuer,
          name: data.name,
          workspaceId,
        });

      return {
        id: identityProvider.id,
        type: identityProvider.type,
        name: identityProvider.name,
        status: identityProvider.status,
        issuer: identityProvider.issuer,
      };
    } catch (err) {
      if (err instanceof SsoException) {
        return err;
      }

      this.exceptionHandlerService.captureExceptions([err]);

      return new SsoException(
        'Unknown SSO configuration error',
        SsoExceptionCode.UNKNOWN_SSO_CONFIGURATION_ERROR,
      );
    }
  }

  async createSamlIdentityProvider(
    data: Pick<
      WorkspaceSsoIdentityProviderEntity,
      'ssoURL' | 'certificate' | 'fingerprint' | 'id'
    >,
    workspaceId: string,
  ) {
    await this.isSsoEnabled(workspaceId);

    const identityProvider =
      await this.workspaceSsoIdentityProviderRepository.save({
        ...data,
        type: IdentityProviderType.SAML,
        workspaceId,
      });

    return {
      id: identityProvider.id,
      type: identityProvider.type,
      name: identityProvider.name,
      issuer: this.buildIssuerURL(identityProvider),
      status: identityProvider.status,
    };
  }

  async findSsoIdentityProviderById(identityProviderId: string) {
    return (await this.workspaceSsoIdentityProviderRepository.findOne({
      where: { id: identityProviderId },
      relations: { workspace: true },
    })) as (SsoConfiguration & WorkspaceSsoIdentityProviderEntity) | null;
  }

  buildCallbackUrl(
    identityProvider: Pick<WorkspaceSsoIdentityProviderEntity, 'type' | 'id'>,
  ) {
    const callbackURL = new URL(this.twentyConfigService.get('SERVER_URL'));

    callbackURL.pathname = `/auth/${identityProvider.type.toLowerCase()}/callback`;

    if (identityProvider.type === IdentityProviderType.SAML) {
      callbackURL.pathname += `/${identityProvider.id}`;
    }

    return callbackURL.toString();
  }

  buildIssuerURL(
    identityProvider: Pick<WorkspaceSsoIdentityProviderEntity, 'id' | 'type'>,
    searchParams?: Record<string, string | boolean>,
  ) {
    const authorizationUrl = new URL(
      this.twentyConfigService.get('SERVER_URL'),
    );

    authorizationUrl.pathname = `/auth/${identityProvider.type.toLowerCase()}/login/${identityProvider.id}`;

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        authorizationUrl.searchParams.append(key, value.toString());
      });
    }

    return authorizationUrl.toString();
  }

  private isOidcIdentityProvider(
    identityProvider: WorkspaceSsoIdentityProviderEntity,
  ): identityProvider is OidcConfiguration &
    WorkspaceSsoIdentityProviderEntity {
    return identityProvider.type === IdentityProviderType.OIDC;
  }

  isSamlIdentityProvider(
    identityProvider: WorkspaceSsoIdentityProviderEntity,
  ): identityProvider is SamlConfiguration &
    WorkspaceSsoIdentityProviderEntity {
    return identityProvider.type === IdentityProviderType.SAML;
  }

  getOidcClient(
    identityProvider: WorkspaceSsoIdentityProviderEntity,
    issuer: Issuer,
  ) {
    if (!this.isOidcIdentityProvider(identityProvider)) {
      throw new SsoException(
        'Invalid Identity Provider type',
        SsoExceptionCode.INVALID_IDP_TYPE,
      );
    }

    issuer[custom.http_options] = this.oidcHttpOptions;

    const client = new issuer.Client({
      client_id: identityProvider.clientID,
      client_secret: identityProvider.clientSecret,
      redirect_uris: [this.buildCallbackUrl(identityProvider)],
      response_types: [OidcResponseType.CODE],
    });

    client[custom.http_options] = this.oidcHttpOptions;

    return client;
  }

  async getAuthorizationUrlForSSO(
    identityProviderId: string,
    searchParams: Record<string, string | boolean>,
  ) {
    const identityProvider =
      (await this.workspaceSsoIdentityProviderRepository.findOne({
        where: {
          id: identityProviderId,
        },
      })) as WorkspaceSsoIdentityProviderEntity & SsoConfiguration;

    if (!identityProvider) {
      throw new SsoException(
        'Identity Provider not found',
        SsoExceptionCode.USER_NOT_FOUND,
      );
    }

    return {
      id: identityProvider.id,
      authorizationURL: this.buildIssuerURL(identityProvider, searchParams),
      type: identityProvider.type,
    };
  }

  async getSsoIdentityProviders(workspaceId: string) {
    return (await this.workspaceSsoIdentityProviderRepository.find({
      where: { workspaceId },
      select: ['id', 'name', 'type', 'issuer', 'status'],
    })) as Array<
      Pick<
        WorkspaceSsoIdentityProviderEntity,
        'id' | 'name' | 'type' | 'issuer' | 'status'
      >
    >;
  }

  async deleteSsoIdentityProvider(
    identityProviderId: string,
    workspaceId: string,
  ) {
    const identityProvider =
      await this.workspaceSsoIdentityProviderRepository.findOne({
        where: {
          id: identityProviderId,
          workspaceId,
        },
      });

    if (!identityProvider) {
      throw new SsoException(
        'Identity Provider not found',
        SsoExceptionCode.IDENTITY_PROVIDER_NOT_FOUND,
      );
    }

    await this.workspaceSsoIdentityProviderRepository.delete({
      id: identityProvider.id,
    });

    return { identityProviderId: identityProvider.id };
  }

  async editSsoIdentityProvider(
    payload: Partial<WorkspaceSsoIdentityProviderEntity>,
    workspaceId: string,
  ) {
    const ssoIdp = await this.workspaceSsoIdentityProviderRepository.findOne({
      where: {
        id: payload.id,
        workspaceId,
      },
    });

    if (!ssoIdp) {
      throw new SsoException(
        'Identity Provider not found',
        SsoExceptionCode.IDENTITY_PROVIDER_NOT_FOUND,
      );
    }

    const result = await this.workspaceSsoIdentityProviderRepository.save({
      ...ssoIdp,
      ...payload,
    });

    return {
      id: result.id,
      type: result.type,
      issuer: result.issuer,
      name: result.name,
      status: result.status,
    };
  }
}
