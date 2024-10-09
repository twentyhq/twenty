import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { Repository } from 'typeorm';
import { generators, Issuer } from 'openid-client';

import {
  IdpType,
  OIDCResponseType,
  WorkspaceSSOIdentityProvider,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import {
  OIDCConfiguration,
  SAMLConfiguration,
  SSOConfiguration,
} from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import { User } from 'src/engine/core-modules/user/user.entity';
import {
  SSOException,
  SSOExceptionCode,
} from 'src/engine/core-modules/sso/sso.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class SSOService {
  constructor(
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    @InjectRepository(WorkspaceSSOIdentityProvider, 'core')
    private readonly workspaceSSOIdentityProviderRepository: Repository<WorkspaceSSOIdentityProvider>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly environmentService: EnvironmentService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  private async isSSOEnabled(workspaceId: string) {
    const isSSOEnabledFeatureFlag = await this.featureFlagRepository.findOneBy({
      workspaceId,
      key: FeatureFlagKey.IsSSOEnabled,
      value: true,
    });

    if (!isSSOEnabledFeatureFlag?.value) {
      throw new SSOException(
        `${FeatureFlagKey.IsSSOEnabled} feature flag is disabled`,
        SSOExceptionCode.SSO_DISABLE,
      );
    }
  }

  async createOIDCIdentityProvider(
    data: Pick<
      WorkspaceSSOIdentityProvider,
      'issuer' | 'clientID' | 'clientSecret' | 'name'
    >,
    workspaceId: string,
  ) {
    try {
      await this.isSSOEnabled(workspaceId);

      if (!data.issuer) {
        throw new SSOException(
          'Invalid issuer URL',
          SSOExceptionCode.INVALID_ISSUER_URL,
        );
      }

      const issuer = await Issuer.discover(data.issuer);

      if (!issuer.metadata.issuer) {
        throw new SSOException(
          'Invalid issuer URL from discovery',
          SSOExceptionCode.INVALID_ISSUER_URL,
        );
      }

      const idp = await this.workspaceSSOIdentityProviderRepository.save({
        type: IdpType.OIDC,
        clientID: data.clientID,
        clientSecret: data.clientSecret,
        issuer: issuer.metadata.issuer,
        name: data.name,
        workspaceId,
      });

      return {
        id: idp.id,
        type: idp.type,
        name: idp.name,
        issuer: idp.issuer,
      };
    } catch (err) {
      if (err instanceof SSOException) {
        return err;
      }

      return new SSOException(
        'Unknown SSO configuration error',
        SSOExceptionCode.UNKNOWN_SSO_CONFIGURATION_ERROR,
      );
    }
  }

  async createSAMLIdentityProvider(
    data: Pick<
      WorkspaceSSOIdentityProvider,
      'ssoURL' | 'certificate' | 'fingerprint' | 'id'
    >,
    workspaceId: string,
  ) {
    await this.isSSOEnabled(workspaceId);

    const idp = await this.workspaceSSOIdentityProviderRepository.save({
      ...data,
      type: IdpType.SAML,
      workspaceId,
    });

    return {
      id: idp.id,
      type: idp.type,
      name: idp.name,
      issuer: this.buildIssuerURL(idp),
      status: idp.status,
    };
  }

  async findAvailableSSOIdentityProviders(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: [
        'workspaces',
        'workspaces.workspace',
        'workspaces.workspace.workspaceSSOIdentityProviders',
      ],
    });

    if (!user) {
      throw new SSOException('User not found', SSOExceptionCode.USER_NOT_FOUND);
    }

    return user.workspaces.flatMap((userWorkspace) =>
      (
        userWorkspace.workspace
          .workspaceSSOIdentityProviders as Array<SSOConfiguration>
      ).reduce((acc, idp) => {
        if (idp.status === 'Inactive') return acc;

        return [
          ...acc,
          {
            id: idp.id,
            name: idp.name ?? 'Unknown',
            issuer: idp.issuer,
            type: idp.type,
            status: idp.status,
            workspace: {
              id: userWorkspace.workspaceId,
              name: userWorkspace.workspace.displayName,
            },
          },
        ];
      }, []),
    );
  }

  async findSSOIdentityProviderById(idpId: string) {
    return (await this.workspaceSSOIdentityProviderRepository.findOne({
      where: { id: idpId },
    })) as (SSOConfiguration & WorkspaceSSOIdentityProvider) | undefined;
  }

  buildCallbackUrl(idp: WorkspaceSSOIdentityProvider) {
    const callbackURL = new URL(this.environmentService.get('SERVER_URL'));

    callbackURL.pathname =
      idp.type === 'OIDC' ? '/auth/oidc/callback' : '/auth/saml/callback';

    return callbackURL.toString();
  }

  buildIssuerURL(idp: WorkspaceSSOIdentityProvider) {
    return `${this.environmentService.get('SERVER_URL')}/auth/saml/login/${idp.id}`;
  }

  private isOIDCIdentityProvider(
    idp: WorkspaceSSOIdentityProvider,
  ): idp is OIDCConfiguration & WorkspaceSSOIdentityProvider {
    return idp.type === IdpType.OIDC;
  }

  isSAMLIdentityProvider(
    idp: WorkspaceSSOIdentityProvider,
  ): idp is SAMLConfiguration & WorkspaceSSOIdentityProvider {
    return idp.type === IdpType.SAML;
  }

  getOIDCClient(idp: WorkspaceSSOIdentityProvider, issuer: Issuer) {
    if (!this.isOIDCIdentityProvider(idp)) {
      throw new SSOException(
        'Invalid Identity Provider type',
        SSOExceptionCode.INVALID_IDP_TYPE,
      );
    }

    return new issuer.Client({
      client_id: idp.clientID,
      client_secret: idp.clientSecret,
      redirect_uris: [this.buildCallbackUrl(idp)],
      response_types: [OIDCResponseType.CODE],
    });
  }

  async getAuthorizationUrl(idpId: string) {
    const idp = (await this.workspaceSSOIdentityProviderRepository.findOne({
      where: {
        id: idpId,
      },
    })) as WorkspaceSSOIdentityProvider & SSOConfiguration;

    if (!idp) {
      throw new SSOException(
        'Identity Provider not found',
        SSOExceptionCode.USER_NOT_FOUND,
      );
    }

    if (idp.type === 'OIDC') {
      return this.loginWithOIDC(idp);
    }

    if (idp.type === 'SAML') {
      return {
        id: idp.id,
        authorizationURL: this.buildIssuerURL(idp),
        type: idp.type,
      };
    }

    throw new SSOException(
      'Invalid Identity Provider type',
      SSOExceptionCode.INVALID_IDP_TYPE,
    );
  }

  async loginWithOIDC(idp: WorkspaceSSOIdentityProvider) {
    if (this.isOIDCIdentityProvider(idp)) {
      const issuer = await Issuer.discover(idp.issuer);
      const code_verifier = generators.codeVerifier();

      const codeVerifierId = crypto.randomUUID();

      await this.cacheStorageService.set(codeVerifierId, code_verifier);

      const code_challenge = generators.codeChallenge(code_verifier);

      const client = this.getOIDCClient(idp, issuer);

      const authorizationURL = client.authorizationUrl({
        scope: 'openid email profile',
        state: JSON.stringify({
          idpId: idp.id,
          codeVerifierId,
        }),
        code_challenge,
        code_challenge_method: 'S256',
      });

      return {
        id: idp.id,
        authorizationURL,
        type: idp.type,
      };
    }

    return null;
  }

  async listSSOIdentityProvidersByWorkspaceId(workspaceId: string) {
    return (await this.workspaceSSOIdentityProviderRepository.find({
      where: { workspaceId },
      select: ['id', 'name', 'type', 'issuer', 'status'],
    })) as Array<
      Pick<
        WorkspaceSSOIdentityProvider,
        'id' | 'name' | 'type' | 'issuer' | 'status'
      >
    >;
  }

  async deleteSSOIdentityProvider(idpId: string, workspaceId: string) {
    const ssoIdp = await this.workspaceSSOIdentityProviderRepository.findOne({
      where: {
        id: idpId,
        workspaceId,
      },
    });

    if (!ssoIdp) {
      throw new SSOException(
        'Identity Provider not found',
        SSOExceptionCode.IDENTITY_PROVIDER_NOT_FOUND,
      );
    }

    await this.workspaceSSOIdentityProviderRepository.delete(ssoIdp);

    return { idpId: ssoIdp.id };
  }

  async editSSOIdentityProvider(
    payload: Partial<WorkspaceSSOIdentityProvider>,
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
