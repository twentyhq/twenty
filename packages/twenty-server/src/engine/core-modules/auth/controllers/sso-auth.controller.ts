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
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthOAuthExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-oauth-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { EnterpriseFeaturesEnabledGuard } from 'src/engine/core-modules/auth/guards/enterprise-features-enabled.guard';
import { OIDCAuthGuard } from 'src/engine/core-modules/auth/guards/oidc-auth.guard';
import { SAMLAuthGuard } from 'src/engine/core-modules/auth/guards/saml-auth.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { OIDCRequest } from 'src/engine/core-modules/auth/strategies/oidc.auth.strategy';
import { SAMLRequest } from 'src/engine/core-modules/auth/strategies/saml.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import {
  IdentityProviderType,
  WorkspaceSSOIdentityProvider,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('auth')
export class SSOAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly domainManagerService: DomainManagerService,

    private readonly sSOService: SSOService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(WorkspaceSSOIdentityProvider, 'core')
    private readonly workspaceSSOIdentityProviderRepository: Repository<WorkspaceSSOIdentityProvider>,
  ) {}

  @Get('saml/metadata/:identityProviderId')
  @UseGuards(EnterpriseFeaturesEnabledGuard, PublicEndpointGuard)
  @UseFilters(AuthRestApiExceptionFilter)
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
  @UseGuards(EnterpriseFeaturesEnabledGuard, OIDCAuthGuard, PublicEndpointGuard)
  @UseFilters(AuthRestApiExceptionFilter)
  async oidcAuth() {
    // As this method is protected by OIDC Auth guard, it will trigger OIDC SSO flow
    return;
  }

  @Get('saml/login/:identityProviderId')
  @UseGuards(EnterpriseFeaturesEnabledGuard, SAMLAuthGuard, PublicEndpointGuard)
  @UseFilters(AuthRestApiExceptionFilter)
  async samlAuth() {
    // As this method is protected by SAML Auth guard, it will trigger SAML SSO flow
    return;
  }

  @Get('oidc/callback')
  @UseGuards(EnterpriseFeaturesEnabledGuard, OIDCAuthGuard, PublicEndpointGuard)
  @UseFilters(AuthOAuthExceptionFilter)
  async oidcAuthCallback(@Req() req: OIDCRequest, @Res() res: Response) {
    return await this.authCallback(req, res);
  }

  @Post('saml/callback/:identityProviderId')
  @UseGuards(EnterpriseFeaturesEnabledGuard, SAMLAuthGuard, PublicEndpointGuard)
  @UseFilters(AuthOAuthExceptionFilter)
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

      workspaceValidator.assertIsDefinedOrThrow(
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
            this.domainManagerService.getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
              workspaceIdentityProvider?.workspace,
            ),
          pathname: '/verify',
        }),
      );
    }
  }

  private async generateLoginToken(
    payload: { email: string; workspaceInviteHash?: string },
    currentWorkspace: Workspace,
  ) {
    const invitation = payload.email
      ? await this.authService.findInvitationForSignInUp({
          currentWorkspace,
          email: payload.email,
        })
      : undefined;

    const existingUser = await this.userRepository.findOne({
      where: {
        email: payload.email,
      },
    });

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
