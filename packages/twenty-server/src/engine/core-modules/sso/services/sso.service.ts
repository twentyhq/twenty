/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Issuer } from 'openid-client';
import { Repository } from 'typeorm';

import {
  WorkspaceSSOIdentityProviderEntity,
  IdentityProviderType,
  OIDCResponseType,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  SSOException,
  SSOExceptionCode,
} from 'src/engine/core-modules/sso/sso.exception';
import {
  type OIDCConfiguration,
  type SAMLConfiguration,
  type SSOConfiguration,
} from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class SSOService {
  private readonly featureLookUpKey = BillingEntitlementKey.SSO;
  constructor(
    @InjectRepository(WorkspaceSSOIdentityProviderEntity)
    private readonly workspaceSSOIdentityProviderRepository: Repository<WorkspaceSSOIdentityProviderEntity>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly billingService: BillingService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  private async isSSOEnabled(workspaceId: string) {
    const isSSOBillingEnabled = await this.billingService.hasEntitlement(
      workspaceId,
      this.featureLookUpKey,
    );

    if (!isSSOBillingEnabled) {
      throw new SSOException(
        `No entitlement found for this workspace`,
        SSOExceptionCode.SSO_DISABLE,
      );
    }
  }

  private async getIssuerForOIDC(issuerUrl: string) {
    try {
      return await Issuer.discover(issuerUrl);
    } catch {
      throw new SSOException(
        'Invalid issuer',
        SSOExceptionCode.INVALID_ISSUER_URL,
      );
    }
  }

  async createOIDCIdentityProvider(
    data: Pick<
      WorkspaceSSOIdentityProviderEntity,
      'issuer' | 'clientID' | 'clientSecret' | 'name'
    >,
    workspaceId: string,
  ) {
    try {
      await this.isSSOEnabled(workspaceId);

      const issuer = await this.getIssuerForOIDC(data.issuer);

      const identityProvider =
        await this.workspaceSSOIdentityProviderRepository.save({
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
      if (err instanceof SSOException) {
        return err;
      }

      this.exceptionHandlerService.captureExceptions([err]);

      return new SSOException(
        'Unknown SSO configuration error',
        SSOExceptionCode.UNKNOWN_SSO_CONFIGURATION_ERROR,
      );
    }
  }

  async createSAMLIdentityProvider(
    data: Pick<
      WorkspaceSSOIdentityProviderEntity,
      'ssoURL' | 'certificate' | 'fingerprint' | 'id'
    >,
    workspaceId: string,
  ) {
    await this.isSSOEnabled(workspaceId);

    const identityProvider =
      await this.workspaceSSOIdentityProviderRepository.save({
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

  async findSSOIdentityProviderById(identityProviderId: string) {
    return (await this.workspaceSSOIdentityProviderRepository.findOne({
      where: { id: identityProviderId },
      relations: { workspace: true },
    })) as (SSOConfiguration & WorkspaceSSOIdentityProviderEntity) | null;
  }

  buildCallbackUrl(
    identityProvider: Pick<WorkspaceSSOIdentityProviderEntity, 'type' | 'id'>,
  ) {
    const callbackURL = new URL(this.twentyConfigService.get('SERVER_URL'));

    callbackURL.pathname = `/auth/${identityProvider.type.toLowerCase()}/callback`;

    if (identityProvider.type === IdentityProviderType.SAML) {
      callbackURL.pathname += `/${identityProvider.id}`;
    }

    return callbackURL.toString();
  }

  buildIssuerURL(
    identityProvider: Pick<WorkspaceSSOIdentityProviderEntity, 'id' | 'type'>,
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

  private isOIDCIdentityProvider(
    identityProvider: WorkspaceSSOIdentityProviderEntity,
  ): identityProvider is OIDCConfiguration &
    WorkspaceSSOIdentityProviderEntity {
    return identityProvider.type === IdentityProviderType.OIDC;
  }

  isSAMLIdentityProvider(
    identityProvider: WorkspaceSSOIdentityProviderEntity,
  ): identityProvider is SAMLConfiguration &
    WorkspaceSSOIdentityProviderEntity {
    return identityProvider.type === IdentityProviderType.SAML;
  }

  getOIDCClient(
    identityProvider: WorkspaceSSOIdentityProviderEntity,
    issuer: Issuer,
  ) {
    if (!this.isOIDCIdentityProvider(identityProvider)) {
      throw new SSOException(
        'Invalid Identity Provider type',
        SSOExceptionCode.INVALID_IDP_TYPE,
      );
    }

    return new issuer.Client({
      client_id: identityProvider.clientID,
      client_secret: identityProvider.clientSecret,
      redirect_uris: [this.buildCallbackUrl(identityProvider)],
      response_types: [OIDCResponseType.CODE],
    });
  }

  async getAuthorizationUrlForSSO(
    identityProviderId: string,
    searchParams: Record<string, string | boolean>,
  ) {
    const identityProvider =
      (await this.workspaceSSOIdentityProviderRepository.findOne({
        where: {
          id: identityProviderId,
        },
      })) as WorkspaceSSOIdentityProviderEntity & SSOConfiguration;

    if (!identityProvider) {
      throw new SSOException(
        'Identity Provider not found',
        SSOExceptionCode.USER_NOT_FOUND,
      );
    }

    return {
      id: identityProvider.id,
      authorizationURL: this.buildIssuerURL(identityProvider, searchParams),
      type: identityProvider.type,
    };
  }

  async getSSOIdentityProviders(workspaceId: string) {
    return (await this.workspaceSSOIdentityProviderRepository.find({
      where: { workspaceId },
      select: ['id', 'name', 'type', 'issuer', 'status'],
    })) as Array<
      Pick<
        WorkspaceSSOIdentityProviderEntity,
        'id' | 'name' | 'type' | 'issuer' | 'status'
      >
    >;
  }

  async deleteSSOIdentityProvider(
    identityProviderId: string,
    workspaceId: string,
  ) {
    const identityProvider =
      await this.workspaceSSOIdentityProviderRepository.findOne({
        where: {
          id: identityProviderId,
          workspaceId,
        },
      });

    if (!identityProvider) {
      throw new SSOException(
        'Identity Provider not found',
        SSOExceptionCode.IDENTITY_PROVIDER_NOT_FOUND,
      );
    }

    await this.workspaceSSOIdentityProviderRepository.delete({
      id: identityProvider.id,
    });

    return { identityProviderId: identityProvider.id };
  }

  async editSSOIdentityProvider(
    payload: Partial<WorkspaceSSOIdentityProviderEntity>,
    workspaceId: string,
  ) {
    const ssoIdp = await this.workspaceSSOIdentityProviderRepository.findOne({
      where: {
        id: payload.id,
        workspaceId,
      },
    });

    if (!ssoIdp) {
      throw new SSOException(
        'Identity Provider not found',
        SSOExceptionCode.IDENTITY_PROVIDER_NOT_FOUND,
      );
    }

    const result = await this.workspaceSSOIdentityProviderRepository.save({
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
