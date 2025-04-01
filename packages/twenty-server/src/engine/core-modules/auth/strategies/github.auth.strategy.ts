import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { Strategy } from 'passport-github2';
import { APP_LOCALES } from 'twenty-shared/translations';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

export type GitHubRequest = Omit<
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
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(environmentService: EnvironmentService) {
    super({
      clientID: environmentService.get('AUTH_GITHUB_CLIENT_ID'),
      clientSecret: environmentService.get('AUTH_GITHUB_CLIENT_SECRET'),
      callbackURL: environmentService.get('AUTH_GITHUB_CALLBACK_URL'),
      scope: ['user:email', 'read:user'],
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
    request: GitHubRequest,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<void> {
    const { name, emails, photos } = profile;
    const state =
      typeof request.query.state === 'string'
        ? JSON.parse(request.query.state)
        : undefined;

    // GitHub may not provide email in profile, so need to use primary email or first email
    const userEmail = emails && emails.length > 0 
      ? (emails.find(email => email.primary)?.value || emails[0].value)
      : '';

    // Parse name (GitHub provides it as a single string)
    let firstName = null;
    let lastName = null;
    if (name) {
      const nameParts = name.split(' ');
      if (nameParts.length > 1) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      } else {
        firstName = name;
      }
    }

    const user: GitHubRequest['user'] = {
      email: userEmail,
      firstName: firstName,
      lastName: lastName,
      picture: photos?.[0]?.value || null,
      workspaceInviteHash: state?.workspaceInviteHash,
      workspacePersonalInviteToken: state?.workspacePersonalInviteToken,
      workspaceId: state?.workspaceId,
      billingCheckoutSessionState: state?.billingCheckoutSessionState,
      locale: state?.locale,
    };

    done(null, user);
  }
}