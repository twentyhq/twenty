import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { APP_LOCALES } from 'twenty-shared/translations';

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

  authenticate(req: Request, options: any) {
    options = {
      ...options,
      state: JSON.stringify({
        workspaceInviteHash: req.query.workspaceInviteHash,
        workspaceId: req.params.workspaceId,
        billingCheckoutSessionState: req.query.billingCheckoutSessionState,
        workspacePersonalInviteToken: req.query.workspacePersonalInviteToken,
      }),
    };

    return super.authenticate(req, options);
  }

  async validate(
    request: GoogleRequest,
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

    const user: GoogleRequest['user'] = {
      email: emails[0].value,
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
