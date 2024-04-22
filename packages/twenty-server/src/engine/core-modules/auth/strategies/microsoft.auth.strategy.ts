import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-microsoft';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

export type MicrosoftRequest = Omit<
  Request,
  'user' | 'workspace' | 'cacheVersion'
> & {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    picture: string | null;
    workspaceInviteHash?: string;
  };
};

export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(environmentService: EnvironmentService) {
    super({
      clientID: environmentService.get('AUTH_MICROSOFT_CLIENT_ID'),
      clientSecret: environmentService.get('AUTH_MICROSOFT_CLIENT_SECRET'),
      callbackURL: environmentService.get('AUTH_MICROSOFT_CALLBACK_URL'),
      tenant: environmentService.get('AUTH_MICROSOFT_TENANT_ID'),
      scope: ['user.read'],
      passReqToCallback: true,
    });
  }

  authenticate(req: any, options: any) {
    options = {
      ...options,
      state: JSON.stringify({
        workspaceInviteHash: req.params.workspaceInviteHash,
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

    const user: MicrosoftRequest['user'] = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos?.[0]?.value,
      workspaceInviteHash: state.workspaceInviteHash,
    };

    done(null, user);
  }
}
