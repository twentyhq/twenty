/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Issuer } from 'openid-client';
import { Repository } from 'typeorm';

import {
  WorkspaceSsoIdentityProviderEntity,
  IdentityProviderType,
  OidcResponseType,
} from 'src/engine/core-modules/Sso/workspace-Sso-identity-provider.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  SsoException,
  SsoExceptionCode,
} from 'src/engine/core-modules/Sso/Sso.exception';
import {
  type OidcConfiguration,
  type SamlConfiguration,
  type SsoConfiguration,
} from 'src/engine/core-modules/Sso/types/SsoConfigurations.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class SsoService {
  private readonly featureLookUpKey = BillingEntitlementKey.Sso;
  constructor(
    @InjectRepository(WorkspaceSsoIdentityProviderEntity)
    private readonly workspaceSsoIdentityProviderRepository: Repository<WorkspaceSsoIdentityProviderEntity>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingService: BillingService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  private async isSsoEnabled(workspaceId: string) {
    const isSsoBillingEnabled = await this.billingService.hasEntitlement(
      workspaceId,
      this.featureLookUpKey,
    );

    if (!isSsoBillingEnabled) {
      throw new SsoException(
        `No entitlement found for this workspace`,
        SsoExceptionCode.Sso_DISABLE,
      );
    }
  }

  private async getIssuerForOidc(issuerUrl: string) {
    try {
      return await Issuer.discover(issuerUrl);
    } catch {
      throw new SsoException(
        'Invalid issuer',
        SsoExceptionCode.INVALID_ISSUER_URL,
      );
    }
  }

  async createOidcIdentityProvider(
    data: Pick<
      WorkspaceSsoIdentityProviderEntity,
      'issuer' | 'clientId' | 'clientSecret' | 'name'
    >,
    workspaceId: string,
  ) {
    try {
      await this.isSsoEnabled(workspaceId);

      const issuer = await this.getIssuerForOidc(data.issuer);

      const identityProvider =
        await this.workspaceSsoIdentityProviderRepository.save({
          type: IdentityProviderType.Oidc,
          clientId: data.clientId,
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
        'Unknown Sso configuration error',
        SsoExceptionCode.UNKNOWN_Sso_CONFIGURATION_ERROR,
      );
    }
  }

  async createSamlIdentityProvider(
    data: Pick<
      WorkspaceSsoIdentityProviderEntity,
      'ssoUrl' | 'certificate' | 'fingerprint' | 'id'
    >,
    workspaceId: string,
  ) {
    await this.isSsoEnabled(workspaceId);

    const identityProvider =
      await this.workspaceSsoIdentityProviderRepository.save({
        ...data,
        type: IdentityProviderType.Saml,
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
    const callbackURL = new Url(this.twentyConfigService.get('SERVER_URL'));

    callbackURL.pathname = `/auth/${identityProvider.type.toLowerCase()}/callback`;

    if (identityProvider.type === IdentityProviderType.Saml) {
      callbackURL.pathname += `/${identityProvider.id}`;
    }

    return callbackURL.toString();
  }

  buildIssuerURL(
    identityProvider: Pick<WorkspaceSsoIdentityProviderEntity, 'id' | 'type'>,
    searchParams?: Record<string, string | boolean>,
  ) {
    const authorizationUrl = new Url(
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
    return identityProvider.type === IdentityProviderType.Oidc;
  }

  isSamlIdentityProvider(
    identityProvider: WorkspaceSsoIdentityProviderEntity,
  ): identityProvider is SamlConfiguration &
    WorkspaceSsoIdentityProviderEntity {
    return identityProvider.type === IdentityProviderType.Saml;
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

    return new issuer.Client({
      client_id: identityProvider.clientId,
      client_secret: identityProvider.clientSecret,
      redirect_uris: [this.buildCallbackUrl(identityProvider)],
      response_types: [OidcResponseType.CODE],
    });
  }

  async getAuthorizationUrlForSso(
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
    const SsoIdp = await this.workspaceSsoIdentityProviderRepository.findOne({
      where: {
        id: payload.id,
        workspaceId,
      },
    });

    if (!SsoIdp) {
      throw new SsoException(
        'Identity Provider not found',
        SsoExceptionCode.IDENTITY_PROVIDER_NOT_FOUND,
      );
    }

    const result = await this.workspaceSsoIdentityProviderRepository.save({
      ...SsoIdp,
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
