import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { VerifyCallback, Strategy } from 'passport-openidconnect';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

export type OIDCRequest = Omit<
  Request,
  'user' | 'workspace' | 'workspaceMetadataVersion'
> & {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    picture: string | null;
    workspaceInviteHash?: string;
    workspacePersonalInviteToken?: string;
  };
};

export class OIDCStrategy extends PassportStrategy(Strategy, 'oidc') {
  constructor(environmentService: EnvironmentService) {
    super({
      issuer: environmentService.get('AUTH_OIDC_ISSUER'),
      authorizationURL: environmentService.get('AUTH_OIDC_ISSUER'),
      tokenURL: environmentService.get('AUTH_OIDC_TOKEN_URL'),
      userInfoURL: environmentService.get('AUTH_OIDC_USERINFO_URL'),
      clientID: environmentService.get('AUTH_OIDC_CLIENT_ID'),
      clientSecret: environmentService.get('AUTH_OIDC_CLIENT_SECRET'),
      callbackURL: environmentService.get('AUTH_OIDC_CALLBACK_URL'),
      scope: environmentService.get('AUTH_OIDC_SCOPE'),
      passReqToCallback: true,
    });
  }

  authenticate(req: any, options: any) {
    options = {
      ...options,
      state: JSON.stringify({
        workspaceInviteHash: req.params.workspaceInviteHash,
        ...(req.params.workspacePersonalInviteToken
          ? {
              workspacePersonalInviteToken:
                req.params.workspacePersonalInviteToken,
            }
          : {}),
      }),
    };

    return super.authenticate(req, options);
  }

  async validate(
    request: OIDCRequest,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos } = profile;

    const state =
      typeof request.query.state === 'string'
        ? JSON.parse(request.query.state)
        : undefined;

    const email = emails?.[0]?.value ?? null;

    if (!email) {
      throw new AuthException(
        'Email not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const user: OIDCRequest['user'] = {
      email,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos?.[0]?.value,
      workspaceInviteHash: state.workspaceInviteHash,
      workspacePersonalInviteToken: state.workspacePersonalInviteToken,
    };

    done(null, user);
  }
}
