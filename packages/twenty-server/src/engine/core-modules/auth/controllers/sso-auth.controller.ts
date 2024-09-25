import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { Issuer } from 'openid-client';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { IdpType } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { SSOProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/sso-provider-enabled.guard';
import { SAMLAuthGuard } from 'src/engine/core-modules/auth/guards/saml-auth.guard';
import { OIDCAuthGuard } from 'src/engine/core-modules/auth/guards/oidc-auth.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';

@Controller('auth')
@UseFilters(AuthRestApiExceptionFilter)
export class SSOAuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly sSOService: SSOService,
    private readonly authService: AuthService,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  private extractState(req: any):
    | {
        result: {
          codeVerifierId: string;
          idpId: string;
          workspaceInviteHash?: string;
          workspacePersonalInviteToken?: string;
        };
      }
    | { err: Error } {
    try {
      const state = JSON.parse(req.query.state);

      if (!state.codeVerifierId || !state.idpId) {
        return { err: new Error('state_invalid') };
      }

      return { result: state };
    } catch (err) {
      return { err };
    }
  }

  @Get('saml/login/:idpId')
  @UseGuards(SSOProviderEnabledGuard, SAMLAuthGuard)
  async samlLogin() {
    // As this method is protected by Saml Auth guard, it will trigger Saml SSO flow
  }

  @Get('oidc/callback')
  @UseGuards(SSOProviderEnabledGuard, OIDCAuthGuard)
  async oidcAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const extractedState = this.extractState(req);

      if ('err' in extractedState) {
        throw new Error('Invalid state');
      }

      const { idpId, codeVerifierId } = extractedState.result;
      const idp = await this.sSOService.findSSOIdentityProviderById(idpId);

      if (!idp || idp.type !== IdpType.OIDC) {
        // TODO: throw a proper exception
        throw new Error('Identity provider not found');
      }

      const issuer = await Issuer.discover(idp.issuer);

      const client = this.sSOService.getOIDCClient(idp, issuer);

      const params = client.callbackParams(req);

      const codeVerifier =
        await this.cacheStorageService.get<string>(codeVerifierId);

      if (!codeVerifier) {
        // TODO: throw a proper exception
        throw new Error('Code verifier not found');
      }

      const tokenSet = await client.callback(
        this.sSOService.buildCallbackUrl(idp),
        params,
        {
          code_verifier: codeVerifier,
          state: req.query.state,
          response_type: 'code',
        },
      );

      if (!tokenSet.access_token) {
        // TODO: throw a proper exception
        throw new Error('Access token not found');
      }

      const userInfo = await client.userinfo<{ email: string }>(
        tokenSet.access_token,
      );

      if (
        extractedState.result.workspaceInviteHash &&
        extractedState.result.workspacePersonalInviteToken
      ) {
        await this.authService.signInUp({
          email: userInfo.email,
          workspaceInviteHash: extractedState.result.workspaceInviteHash,
          workspacePersonalInviteToken:
            extractedState.result.workspacePersonalInviteToken,
          fromSSO: true,
        });
      }

      const loginToken = await this.tokenService.generateLoginToken(
        userInfo.email,
      );

      return res.redirect(
        this.tokenService.computeRedirectURI(loginToken.token),
      );
    } catch (err) {
      res.status(403).send(err.message);
    }
  }

  @Post('saml/callback')
  @UseGuards(SSOProviderEnabledGuard, SAMLAuthGuard)
  async samlAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const email = req.user.email;

      if (
        req.user.workspaceInviteHash &&
        req.user.workspacePersonalInviteToken
      ) {
        await this.authService.signInUp({
          email,
          workspaceInviteHash: req.user.workspaceInviteHash,
          workspacePersonalInviteToken: req.user.workspacePersonalInviteToken,
          fromSSO: true,
        });
      }

      const loginToken = await this.tokenService.generateLoginToken(email);

      return res.redirect(
        this.tokenService.computeRedirectURI(loginToken.token),
      );
    } catch (err) {
      console.log('>>>>>>>>>>>>>>', err);
      res.status(403).send(err.message);
    }
  }
}
