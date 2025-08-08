import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { type Request } from 'express';
import { Strategy, type VerifyCallback } from 'passport-google-oauth20';
import { type APP_LOCALES } from 'twenty-shared/translations';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type SocialSSOSignInUpActionType } from 'src/engine/core-modules/auth/types/signInUp.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type GoogleRequest = Omit<
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
    action: SocialSSOSignInUpActionType;
    workspaceId?: string;
    billingCheckoutSessionState?: string;
  };
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(twentyConfigService: TwentyConfigService) {
    super({
      clientID: twentyConfigService.get('AUTH_GOOGLE_CLIENT_ID'),
      clientSecret: twentyConfigService.get('AUTH_GOOGLE_CLIENT_SECRET'),
      callbackURL: twentyConfigService.get('AUTH_GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate(req: Request, options: any) {
    options = {
      ...options,
      state: JSON.stringify({
        workspaceInviteHash: req.query.workspaceInviteHash,
        workspaceId: req.params.workspaceId,
        billingCheckoutSessionState: req.query.billingCheckoutSessionState,
        workspacePersonalInviteToken: req.query.workspacePersonalInviteToken,
        action: req.query.action,
      }),
    };

    return super.authenticate(req, options);
  }

  async validate(
    request: GoogleRequest,
    _accessToken: string,
    _refreshToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos } = profile;
    const state =
      typeof request.query.state === 'string'
        ? JSON.parse(request.query.state)
        : undefined;

    const firstVerifiedEmail = emails.find(
      (email: { verified: boolean }) => email?.verified === true,
    )?.value;

    if (!firstVerifiedEmail) {
      throw new AuthException(
        'Please verify your email address with Google',
        AuthExceptionCode.EMAIL_NOT_VERIFIED,
      );
    }

    const user: GoogleRequest['user'] = {
      email: firstVerifiedEmail,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos?.[0]?.value,
      workspaceInviteHash: state.workspaceInviteHash,
      workspacePersonalInviteToken: state.workspacePersonalInviteToken,
      workspaceId: state.workspaceId,
      billingCheckoutSessionState: state.billingCheckoutSessionState,
      action: state.action,
      locale: state.locale,
    };

    done(null, user);
  }
}
