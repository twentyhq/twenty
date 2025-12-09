/* @license Enterprise */

import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateServiceProviderMetadata } from '@node-saml/node-saml';
import { Response } from 'express';
import { AppPath } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { EnterpriseFeaturesEnabledGuard } from 'src/engine/core-modules/auth/guards/enterprise-features-enabled.guard';
import { OIDCAuthGuard } from 'src/engine/core-modules/auth/guards/oidc-auth.guard';
import { SAMLAuthGuard } from 'src/engine/core-modules/auth/guards/saml-auth.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { OIDCRequest } from 'src/engine/core-modules/auth/strategies/oidc.auth.strategy';
import { SAMLRequest } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import {
  IdentityProviderType,
  WorkspaceSSOIdentityProviderEntity,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('auth')
@UseFilters(AuthRestApiExceptionFilter)
export class SSOAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly userService: UserService,
    private readonly sSOService: SSOService,
    @InjectRepository(WorkspaceSSOIdentityProviderEntity)
    private readonly workspaceSSOIdentityProviderRepository: Repository<WorkspaceSSOIdentityProviderEntity>,
  ) {}

  @Get('saml/metadata/:identityProviderId')
  @UseGuards(
    EnterpriseFeaturesEnabledGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async generateMetadata(@Req() req: any): Promise<string | void> {
    return generateServiceProviderMetadata({
      wantAssertionsSigned: false,
      issuer: this.sSOService.buildIssuerURL({
        id: req.params.identityProviderId,
        type: IdentityProviderType.SAML,
      }),
      callbackUrl: this.sSOService.buildCallbackUrl({
        id: req.params.identityProviderId,
        type: IdentityProviderType.SAML,
      }),
    });
  }

  @Get('oidc/login/:identityProviderId')
  @UseGuards(
    EnterpriseFeaturesEnabledGuard,
    OIDCAuthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async oidcAuth() {
    // As this method is protected by OIDC Auth guard, it will trigger OIDC SSO flow
    return;
  }

  @Get('saml/login/:identityProviderId')
  @UseGuards(
    EnterpriseFeaturesEnabledGuard,
    SAMLAuthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async samlAuth() {
    // As this method is protected by SAML Auth guard, it will trigger SAML SSO flow
    return;
  }

  @Get('oidc/callback')
  @UseGuards(
    EnterpriseFeaturesEnabledGuard,
    OIDCAuthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async oidcAuthCallback(@Req() req: OIDCRequest, @Res() res: Response) {
    return await this.authCallback(req, res);
  }

  @Post('saml/callback/:identityProviderId')
  @UseGuards(
    EnterpriseFeaturesEnabledGuard,
    SAMLAuthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async samlAuthCallback(@Req() req: SAMLRequest, @Res() res: Response) {
    try {
      return await this.authCallback(req, res);
    } catch (err) {
      return new AuthException(
        err.message ?? 'Access denied',
        AuthExceptionCode.OAUTH_ACCESS_DENIED,
      );
    }
  }

  private async authCallback(req: OIDCRequest | SAMLRequest, res: Response) {
    const workspaceIdentityProvider =
      await this.workspaceSSOIdentityProviderRepository.findOne({
        where: { id: req.user.identityProviderId },
        relations: { workspace: true },
      });

    try {
      if (!workspaceIdentityProvider) {
        throw new AuthException(
          'Identity provider not found',
          AuthExceptionCode.OAUTH_ACCESS_DENIED,
        );
      }

      if (!req.user.email) {
        throw new AuthException(
          'Email not found from identity provider.',
          AuthExceptionCode.OAUTH_ACCESS_DENIED,
        );
      }

      const currentWorkspace = await this.authService.findWorkspaceForSignInUp({
        workspaceId: workspaceIdentityProvider.workspaceId,
        workspaceInviteHash: req.user.workspaceInviteHash,
        email: req.user.email,
        authProvider: AuthProviderEnum.SSO,
      });

      assertIsDefinedOrThrow(
        currentWorkspace,
        new AuthException(
          'Workspace not found',
          AuthExceptionCode.OAUTH_ACCESS_DENIED,
        ),
      );

      const { loginToken } = await this.generateLoginToken(
        req.user,
        currentWorkspace,
      );

      return res.redirect(
        this.authService.computeRedirectURI({
          loginToken: loginToken.token,
          workspace: currentWorkspace,
        }),
      );
    } catch (error) {
      return res.redirect(
        this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions({
          error,
          workspace:
            this.workspaceDomainsService.getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
              workspaceIdentityProvider?.workspace,
            ),
          pathname: AppPath.Verify,
        }),
      );
    }
  }

  private async generateLoginToken(
    payload: { email: string; workspaceInviteHash?: string },
    currentWorkspace: WorkspaceEntity,
  ) {
    const invitation = payload.email
      ? await this.authService.findInvitationForSignInUp({
          currentWorkspace,
          email: payload.email,
        })
      : undefined;

    const existingUser = await this.userService.findUserByEmail(payload.email);

    const { userData } = this.authService.formatUserDataPayload(
      payload,
      existingUser,
    );

    await this.authService.checkAccessForSignIn({
      userData,
      invitation,
      workspaceInviteHash: payload.workspaceInviteHash,
      workspace: currentWorkspace,
    });

    const { workspace, user } = await this.authService.signInUp({
      userData,
      workspace: currentWorkspace,
      invitation,
      authParams: {
        provider: AuthProviderEnum.SSO,
      },
    });

    return {
      workspace,
      loginToken: await this.loginTokenService.generateLoginToken(
        user.email,
        workspace.id,
        AuthProviderEnum.SSO,
      ),
    };
  }
}
