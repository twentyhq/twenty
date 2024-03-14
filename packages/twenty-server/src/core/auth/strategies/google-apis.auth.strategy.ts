import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Request } from 'express';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

export type GoogleAPIsRequest = Request & {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    picture: string | null;
    workspaceInviteHash?: string;
    accessToken: string;
    refreshToken: string;
    transientToken: string;
  };
};

@Injectable()
export class GoogleAPIsStrategy extends PassportStrategy(
  Strategy,
  'google-apis',
) {
  constructor(environmentService: EnvironmentService) {
    const scope = ['email', 'profile'];

    if (environmentService.isMessagingProviderGmailEnabled()) {
      scope.push('https://www.googleapis.com/auth/gmail.readonly');
    }

    if (environmentService.isCalendarProviderGoogleEnabled()) {
      scope.push('https://www.googleapis.com/auth/calendar');
    }

    super({
      clientID: environmentService.getAuthGoogleClientId(),
      clientSecret: environmentService.getAuthGoogleClientSecret(),
      callbackURL: environmentService.isCalendarProviderGoogleEnabled()
        ? environmentService.getAuthGoogleAPIsCallbackUrl()
        : environmentService.getMessagingProviderGmailCallbackUrl(),
      scope,
      passReqToCallback: true,
    });
  }

  authenticate(req: any, options: any) {
    options = {
      ...options,
      accessType: 'offline',
      prompt: 'consent',
      state: JSON.stringify({
        transientToken: req.params.transientToken,
      }),
    };

    return super.authenticate(req, options);
  }

  async validate(
    request: GoogleAPIsRequest,
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

    const user: GoogleAPIsRequest['user'] = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos?.[0]?.value,
      accessToken,
      refreshToken,
      transientToken: state.transientToken,
    };

    done(null, user);
  }
}
