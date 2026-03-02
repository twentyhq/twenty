import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { type Request } from 'express';
import { type VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-microsoft';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { parseJson } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type MicrosoftPassportProfile } from 'src/engine/core-modules/auth/types/microsoft-passport-profile.type';
import { type SocialSSOSignInUpActionType } from 'src/engine/core-modules/auth/types/signInUp.type';
import { type SocialSSOState } from 'src/engine/core-modules/auth/types/social-sso-state.type';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
    action: SocialSSOSignInUpActionType;
  };
};

@Injectable()
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate(req: Request, options: any) {
    options = {
      ...options,
      state: JSON.stringify({
        workspaceInviteHash: req.query.workspaceInviteHash,
        workspaceId: req.params.workspaceId,
        locale: req.query.locale,
        billingCheckoutSessionState: req.query.billingCheckoutSessionState,
        workspacePersonalInviteToken: req.query.workspacePersonalInviteToken,
        action: req.query.action,
      }),
    };

    return super.authenticate(req, options);
  }

  async validate(
    request: MicrosoftRequest,
    _accessToken: string,
    _refreshToken: string,
    profile: MicrosoftPassportProfile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, userPrincipalName, photos } = profile;
    const state = parseJson<SocialSSOState>(request.query.state as string);

    if (!userPrincipalName) {
      throw new AuthException(
        'User principal name not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const user: MicrosoftRequest['user'] = {
      email: userPrincipalName,
      firstName: name?.givenName,
      lastName: name?.familyName,
      picture: photos?.[0]?.value ?? null,
      workspaceInviteHash: state?.workspaceInviteHash,
      workspacePersonalInviteToken: state?.workspacePersonalInviteToken,
      workspaceId: state?.workspaceId,
      billingCheckoutSessionState: state?.billingCheckoutSessionState,
      locale: state?.locale,
      action: state?.action ?? 'list-available-workspaces',
    };

    done(null, user);
  }
}
