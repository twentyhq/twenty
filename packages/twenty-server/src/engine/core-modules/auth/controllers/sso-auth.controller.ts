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

import { generateServiceProviderMetadata } from '@node-Saml/node-Saml';
import { Response } from 'express';
import { AppPath, ConnectedAccountProvider } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-Api-exception.filter';
import { EnterpriseFeaturesEnabledGuard } from 'src/engine/core-modules/auth/guards/enterprise-features-enabled.guard';
import { OidcAuthGuard } from 'src/engine/core-modules/auth/guards/Oidc-auth.guard';
import { SamlAuthGuard } from 'src/engine/core-modules/auth/guards/Saml-auth.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { OidcRequest } from 'src/engine/core-modules/auth/strategies/Oidc.auth.strategy';
import { SamlRequest } from 'src/engine/core-modules/auth/strategies/Saml.auth.strategy';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { SsoService } from 'src/engine/core-modules/Sso/services/Sso.service';
import {
  IdentityProviderType,
  WorkspaceSsoIdentityProviderEntity,
} from 'src/engine/core-modules/Sso/workspace-Sso-identity-provider.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('auth')
@UseFilters(AuthRestApiExceptionFilter)
export class SsoAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly userService: UserService,
    private readonly SsoService: SsoService,
    @InjectRepository(WorkspaceSsoIdentityProviderEntity)
    private readonly workspaceSsoIdentityProviderRepository: Repository<WorkspaceSsoIdentityProviderEntity>,
  ) {}

  @Get('Saml/metadata/:identityProviderId')
  @UseGuards(
    EnterpriseFeaturesEnabledGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  async generateMetadata(@Req() req: any): Promise<string | void> {
    return generateServiceProviderMetadata({
      wantAssertionsSigned: true,
      issuer: this.SsoService.buildIssuerURL({
        id: req.params.identityProviderId,
        type: IdentityProviderType.Saml,
      }),
      callbackUrl: this.SsoService.buildCallbackUrl({
        id: req.params.identityProviderId,
        type: IdentityProviderType.Saml,
      }),
    });
  }

  @Get('Oidc/login/:identityProviderId')
  @UseGuards(
    EnterpriseFeaturesEnabledGuard,
    OidcAuthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async OidcAuth() {
    // As this method is protected by Oidc Auth guard, it will trigger Oidc Sso flow
    return;
  }

  @Get('Saml/login/:identityProviderId')
  @UseGuards(
    EnterpriseFeaturesEnabledGuard,
    SamlAuthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async SamlAuth() {
    // As this method is protected by Saml Auth guard, it will trigger Saml Sso flow
    return;
  }

  @Get('Oidc/callback')
  @UseGuards(
    EnterpriseFeaturesEnabledGuard,
    OidcAuthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async OidcAuthCallback(@Req() req: OidcRequest, @Res() res: Response) {
    return await this.authCallback(req, res);
  }

  @Post('Saml/callback/:identityProviderId')
  @UseGuards(
    EnterpriseFeaturesEnabledGuard,
    SamlAuthGuard,
    PublicEndpointGuard,
    NoPermissionGuard,
  )
  async SamlAuthCallback(@Req() req: SamlRequest, @Res() res: Response) {
    try {
      return await this.authCallback(req, res);
    } catch (err) {
      return new AuthException(
        err.message ?? 'Access denied',
        AuthExceptionCode.OAUTH_ACCESS_DENIED,
      );
    }
  }

  private async authCallback(req: OidcRequest | SamlRequest, res: Response) {
    const workspaceIdentityProvider =
      await this.workspaceSsoIdentityProviderRepository.findOne({
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
        authProvider: AuthProviderEnum.Sso,
      });

      assertIsDefinedOrThrow(
        currentWorkspace,
        new AuthException(
          'Workspace not found',
          AuthExceptionCode.OAUTH_ACCESS_DENIED,
        ),
      );

      const OidcTokenClaims =
        'OidcTokenClaims' in req.user ? req.user.OidcTokenClaims : undefined;

      const connectedAccountProvider =
        workspaceIdentityProvider.type === IdentityProviderType.Saml
          ? ConnectedAccountProvider.Saml
          : ConnectedAccountProvider.Oidc;

      const { loginToken } = await this.generateLoginToken(
        req.user,
        currentWorkspace,
        { OidcTokenClaims, connectedAccountProvider },
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
    SsoContext?: {
      OidcTokenClaims?: Record<string, unknown>;
      connectedAccountProvider: ConnectedAccountProvider;
    },
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
        provider: AuthProviderEnum.Sso,
      },
    });

    if (SsoContext) {
      await this.authService.createSsoConnectedAccountIfFeatureFlagIsOn({
        workspaceId: workspace.id,
        userId: user.id,
        handle: payload.email.toLowerCase(),
        authProvider: AuthProviderEnum.Sso,
        OidcTokenClaims: SsoContext.OidcTokenClaims,
        connectedAccountProvider: SsoContext.connectedAccountProvider,
      });
    }

    return {
      workspace,
      loginToken: await this.loginTokenService.generateLoginToken(
        user.email,
        workspace.id,
        AuthProviderEnum.Sso,
      ),
    };
  }
}
