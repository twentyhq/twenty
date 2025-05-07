import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-microsoft';
import { APP_LOCALES } from 'twenty-shared/translations';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type MicrosoftRequest = Omit<
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
    workspacePersonalInviteToken?: string;
    workspaceId?: string;
    billingCheckoutSessionState?: string;
  };
};

export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(twentyConfigService: TwentyConfigService) {
    super({
      clientID: twentyConfigService.get('AUTH_MICROSOFT_CLIENT_ID'),
      clientSecret: twentyConfigService.get('AUTH_MICROSOFT_CLIENT_SECRET'),
      callbackURL: twentyConfigService.get('AUTH_MICROSOFT_CALLBACK_URL'),
      tenant: 'common',
      scope: ['user.read'],
      passReqToCallback: true,
    });
  }

  authenticate(req: Request, options: any) {
    options = {
      ...options,
      state: JSON.stringify({
        workspaceInviteHash: req.query.workspaceInviteHash,
        workspaceId: req.params.workspaceId,
        locale: req.query.locale,
        billingCheckoutSessionState: req.query.billingCheckoutSessionState,
        workspacePersonalInviteToken: req.query.workspacePersonalInviteToken,
      }),
    };

    return super.authenticate(req, options);
  }

  async validate(
    request: MicrosoftRequest,
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

    const user: MicrosoftRequest['user'] = {
      email,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos?.[0]?.value,
      workspaceInviteHash: state.workspaceInviteHash,
      workspacePersonalInviteToken: state.workspacePersonalInviteToken,
      workspaceId: state.workspaceId,
      billingCheckoutSessionState: state.billingCheckoutSessionState,
      locale: state.locale,
    };

    done(null, user);
  }
}
