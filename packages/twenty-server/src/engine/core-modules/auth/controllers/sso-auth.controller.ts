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
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { OIDCAuthGuard } from 'src/engine/core-modules/auth/guards/oidc-auth.guard';
import { SAMLAuthGuard } from 'src/engine/core-modules/auth/guards/saml-auth.guard';
import { SSOProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/sso-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import {
  IdentityProviderType,
  WorkspaceSSOIdentityProvider,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { User } from 'src/engine/core-modules/user/user.entity';

@Controller('auth')
@UseFilters(AuthRestApiExceptionFilter)
export class SSOAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly domainManagerService: DomainManagerService,
    private readonly ssoService: SSOService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(WorkspaceSSOIdentityProvider, 'core')
    private readonly workspaceSSOIdentityProviderRepository: Repository<WorkspaceSSOIdentityProvider>,
  ) {}

  @Get('saml/metadata/:identityProviderId')
  @UseGuards(SSOProviderEnabledGuard)
  async generateMetadata(@Req() req: any): Promise<string | void> {
    return generateServiceProviderMetadata({
      wantAssertionsSigned: false,
      issuer: this.ssoService.buildIssuerURL({
        id: req.params.identityProviderId,
        type: IdentityProviderType.SAML,
      }),
      callbackUrl: this.ssoService.buildCallbackUrl({
        id: req.params.identityProviderId,
        type: IdentityProviderType.SAML,
      }),
    });
  }

  @Get('oidc/login/:identityProviderId')
  @UseGuards(SSOProviderEnabledGuard, OIDCAuthGuard)
  async oidcAuth() {
    // As this method is protected by OIDC Auth guard, it will trigger OIDC SSO flow
    return;
  }

  @Get('saml/login/:identityProviderId')
  @UseGuards(SSOProviderEnabledGuard, SAMLAuthGuard)
  async samlAuth() {
    // As this method is protected by SAML Auth guard, it will trigger SAML SSO flow
    return;
  }

  @Get('oidc/callback')
  @UseGuards(SSOProviderEnabledGuard, OIDCAuthGuard)
  async oidcAuthCallback(@Req() req: any, @Res() res: Response) {
    return this.authCallback(req, res);
  }

  @Post('saml/callback/:identityProviderId')
  @UseGuards(SSOProviderEnabledGuard, SAMLAuthGuard)
  async samlAuthCallback(@Req() req: any, @Res() res: Response) {
    return this.authCallback(req, res);
  }

  private async authCallback({ user }: any, res: Response) {
    const workspaceIdentityProvider =
      await this.findWorkspaceIdentityProviderByIdentityProviderId(
        user.identityProviderId,
      );

    if (!workspaceIdentityProvider) {
      throw new AuthException(
        'Identity provider not found',
        AuthExceptionCode.INVALID_DATA,
      );
    }

    if (!user.user.email) {
      throw new AuthException(
        'Email not found',
        AuthExceptionCode.INVALID_DATA,
      );
    }

    try {
      const { loginToken, identityProvider } = await this.generateLoginToken(
        user.user,
        workspaceIdentityProvider,
      );

      return res.redirect(
        this.authService.computeRedirectURI({
          loginToken: loginToken.token,
          subdomain: identityProvider.workspace.subdomain,
        }),
      );
    } catch (err) {
      if (err instanceof AuthException) {
        return res.redirect(
          this.domainManagerService.computeRedirectErrorUrl(err.message, {
            subdomain: workspaceIdentityProvider.workspace.subdomain,
          }),
        );
      }
      throw err;
    }
  }

  private async findWorkspaceIdentityProviderByIdentityProviderId(
    identityProviderId: string,
  ) {
    return await this.workspaceSSOIdentityProviderRepository.findOne({
      where: { id: identityProviderId },
      relations: ['workspace'],
    });
  }

  private async generateLoginToken(
    payload: { email: string } & Record<string, string>,
    identityProvider: WorkspaceSSOIdentityProvider,
  ) {
    if (!identityProvider) {
      throw new AuthException(
        'Identity provider not found',
        AuthExceptionCode.INVALID_DATA,
      );
    }

    const invitation = await this.authService.findInvitationForSignInUp({
      currentWorkspace: identityProvider.workspace,
      email: payload.email,
    });

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
      workspace: identityProvider.workspace,
    });

    const { workspace, user } = await this.authService.signInUp({
      userData,
      workspace: identityProvider.workspace,
      invitation,
      authParams: {
        provider: 'sso',
      },
    });

    return {
      identityProvider,
      loginToken: await this.loginTokenService.generateLoginToken(
        user.email,
        workspace.id,
      ),
    };
  }
}
