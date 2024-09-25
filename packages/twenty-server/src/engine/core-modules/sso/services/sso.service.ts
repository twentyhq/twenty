import { Injectable } from '@nestjs/common';
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

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class SSOService {
  constructor(
    @InjectRepository(WorkspaceSSOIdentityProvider, 'core')
    private readonly workspaceSSOIdentityProviderRepository: Repository<WorkspaceSSOIdentityProvider>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly environmentService: EnvironmentService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async createOIDCIdentityProvider(
    data: Pick<
      WorkspaceSSOIdentityProvider,
      'issuer' | 'clientID' | 'clientSecret'
    >,
    workspaceId: string,
  ) {
    if (!data.issuer) {
      throw new SSOException(
        'Invalid issuer URL',
        SSOExceptionCode.INVALID_ISSUER_URL,
      );
    }

    const issuer = await Issuer.discover(data.issuer);

    if (issuer.metadata.issuer) {
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
      workspaceId,
    });

    return {
      id: idp.id,
      type: idp.type,
    };
  }

  async createSAMLIdentityProvider(
    data: Pick<
      WorkspaceSSOIdentityProvider,
      'ssoURL' | 'certificate' | 'fingerprint'
    >,
    workspaceId: string,
  ) {
    const idp = await this.workspaceSSOIdentityProviderRepository.save({
      ...data,
      type: IdpType.SAML,
      workspaceId,
    });

    return {
      id: idp.id,
      type: idp.type,
      // TODO url should be generate before the creation of the entity
      issuer: this.buildIssuerURL(idp),
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
      ).map(async (idp) => ({
        id: idp.id,
        name: idp.name ?? 'Unknown',
        type: idp.type,
      })),
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

  async loginWithSSO(idpId: string) {
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
}
