import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { type Request } from 'express';
import { Issuer, Strategy, type TokenSet } from 'openid-client';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { parseJson } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type SocialSSOSignInUpActionType } from 'src/engine/core-modules/auth/types/signInUp.type';
import { type SocialSSOState } from 'src/engine/core-modules/auth/types/social-sso-state.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type OidcSocialRequest = Omit<
  Request,
  'user' | 'workspace' | 'workspaceMetadataVersion'
> & {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    picture: string | null;
    locale?: keyof typeof APP_LOCALES | null;
    workspaceInviteHash?: string;
    action: SocialSSOSignInUpActionType;
    workspaceId?: string;
    billingCheckoutSessionState?: string;
    returnToPath?: string;
  };
};

export const createOidcClient = async (
  twentyConfigService: TwentyConfigService,
) => {
  const issuerUrl = twentyConfigService.get('AUTH_OIDC_ISSUER_URL');

  if (!issuerUrl) {
    throw new AuthException(
      'OIDC issuer URL is not configured',
      AuthExceptionCode.INVALID_INPUT,
    );
  }

  const issuer = await Issuer.discover(issuerUrl);

  const serverUrl = twentyConfigService.get('SERVER_URL');
  const callbackUrl =
    twentyConfigService.get('AUTH_OIDC_CALLBACK_URL') ||
    new URL('/auth/openid/redirect', serverUrl).toString();

  return new issuer.Client({
    client_id: twentyConfigService.get('AUTH_OIDC_CLIENT_ID') ?? '',
    client_secret: twentyConfigService.get('AUTH_OIDC_CLIENT_SECRET') ?? '',
    redirect_uris: [callbackUrl],
    response_types: ['code'],
  });
};

@Injectable()
export class OidcSocialStrategy extends PassportStrategy(Strategy, 'openid-connect') {
  // oxlint-disable-next-line typescript/no-explicit-any
  constructor(client: any, scopes: string = 'openid email profile') {
    super({
      client,
      params: {
        scope: scopes,
        code_challenge_method: 'S256',
      },
      usePKCE: true,
      passReqToCallback: true,
    });
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  authenticate(req: Request, options: any) {
    options = {
      ...options,
      state: JSON.stringify({
        workspaceInviteHash: req.query.workspaceInviteHash,
        workspaceId: req.params.workspaceId,
        billingCheckoutSessionState: req.query.billingCheckoutSessionState,
        action: req.query.action,
        locale: req.query.locale,
        returnToPath: req.query.returnToPath,
      }),
    };

    return super.authenticate(req, options);
  }

  async validate(
    request: Request,
    tokenset: TokenSet,
    // oxlint-disable-next-line typescript/no-explicit-any
    done: (err: any, user?: OidcSocialRequest['user']) => void,
  ): Promise<void> {
    try {
      const state = parseJson<SocialSSOState>(request.query.state as string);
      // oxlint-disable-next-line typescript/no-explicit-any
      const userinfo = await (this as any)._client.userinfo(tokenset);

      const email = userinfo.email ?? userinfo.upn;

      if (!email || typeof email !== 'string') {
        throw new AuthException(
          'Email not found from OIDC identity provider',
          AuthExceptionCode.EMAIL_NOT_VERIFIED,
        );
      }

      const user: OidcSocialRequest['user'] = {
        email: email.toLowerCase(),
        firstName:
          (userinfo.given_name as string) ??
          (userinfo.name as string)?.split(' ')?.[0] ??
          null,
        lastName:
          (userinfo.family_name as string) ??
          (userinfo.name as string)?.split(' ')?.slice(1)?.join(' ') ??
          null,
        picture:
          (userinfo.picture as string) ??
          (userinfo.avatar_url as string) ??
          null,
        workspaceInviteHash: state?.workspaceInviteHash,
        workspaceId: state?.workspaceId,
        billingCheckoutSessionState: state?.billingCheckoutSessionState,
        action: state?.action ?? 'list-available-workspaces',
        locale: state?.locale,
        returnToPath: state?.returnToPath,
      };

      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
