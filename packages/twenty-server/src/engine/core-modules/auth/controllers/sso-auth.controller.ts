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
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Controller('auth')
@UseFilters(AuthRestApiExceptionFilter)
export class SSOAuthController {
  constructor(
    private readonly loginTokenService: LoginTokenService,
    private readonly authService: AuthService,
    private readonly domainManagerService: DomainManagerService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly environmentService: EnvironmentService,
    private readonly ssoService: SSOService,
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
    try {
      const { loginToken, identityProvider } = await this.generateLoginToken(
        req.user,
      );

      return res.redirect(
        await this.authService.computeRedirectURI(
          loginToken.token,
          identityProvider.workspace.subdomain,
        ),
      );
    } catch (err) {
      if (err instanceof AuthException) {
        return res.redirect(
          this.domainManagerService.computeRedirectErrorUrl({
            subdomain: this.environmentService.get('DEFAULT_SUBDOMAIN'),
            errorMessage: err.message,
          }),
        );
      }
      throw err;
    }
  }

  @Post('saml/callback')
  @UseGuards(SSOProviderEnabledGuard, SAMLAuthGuard)
  async samlAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const { loginToken, identityProvider } = await this.generateLoginToken(
        req.user,
      );

      return res.redirect(
        await this.authService.computeRedirectURI(
          loginToken.token,
          identityProvider.workspace.subdomain,
        ),
      );
    } catch (err) {
      if (err instanceof AuthException) {
        return res.redirect(
          this.domainManagerService.computeRedirectErrorUrl({
            subdomain: this.environmentService.get('DEFAULT_SUBDOMAIN'),
            errorMessage: err.message,
          }),
        );
      }
      throw err;
    }
  }

  private async generateLoginToken({
    user,
    identityProviderId,
  }: {
    identityProviderId?: string;
    user: { email: string } & Record<string, string>;
  }) {
    if (!identityProviderId) {
      throw new AuthException(
        'Identity provider ID is required',
        AuthExceptionCode.INVALID_DATA,
      );
    }

    const identityProvider =
      await this.workspaceSSOIdentityProviderRepository.findOne({
        where: { id: identityProviderId },
        relations: ['workspace'],
      });

    if (!identityProvider) {
      throw new AuthException(
        'Identity provider not found',
        AuthExceptionCode.INVALID_DATA,
      );
    }

    await this.authService.signInUp({
      ...user,
      ...(this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')
        ? {
            targetWorkspaceSubdomain: identityProvider.workspace.subdomain,
          }
        : {}),
      fromSSO: true,
    });

    const isUserExistInWorkspace =
      await this.userWorkspaceService.checkUserWorkspaceExistsByEmail(
        user.email,
        identityProvider.workspaceId,
      );

    if (!isUserExistInWorkspace) {
      throw new AuthException(
        'User not found in workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return {
      identityProvider,
      loginToken: await this.loginTokenService.generateLoginToken(user.email),
    };
  }
}
