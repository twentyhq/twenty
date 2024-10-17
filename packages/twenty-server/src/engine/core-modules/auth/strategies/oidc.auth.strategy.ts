/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  Strategy,
  StrategyOptions,
  StrategyVerifyCallbackReq,
} from 'openid-client';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

@Injectable()
export class OIDCAuthStrategy extends PassportStrategy(
  Strategy,
  'openidconnect',
) {
  constructor(
    private client: StrategyOptions['client'],
    sessionKey: string,
  ) {
    super({
      params: {
        scope: 'openid email profile',
        code_challenge_method: 'S256',
      },
      client,
      usePKCE: true,
      passReqToCallback: true,
      sessionKey,
    });
  }

  async authenticate(req: any, options: any) {
    return super.authenticate(req, {
      ...options,
      state: JSON.stringify({
        identityProviderId: req.params.identityProviderId,
      }),
    });
  }

  validate: StrategyVerifyCallbackReq<{
    identityProviderId: string;
    user: {
      email: string;
      firstName?: string | null;
      lastName?: string | null;
    };
  }> = async (req, tokenset, done) => {
    try {
      const state = JSON.parse(
        'query' in req &&
          req.query &&
          typeof req.query === 'object' &&
          'state' in req.query &&
          req.query.state &&
          typeof req.query.state === 'string'
          ? req.query.state
          : '{}',
      );

      const userinfo = await this.client.userinfo(tokenset);

      if (!userinfo || !userinfo.email) {
        return done(
          new AuthException('Email not found', AuthExceptionCode.INVALID_DATA),
        );
      }

      const user = {
        email: userinfo.email,
        ...(userinfo.given_name ? { firstName: userinfo.given_name } : {}),
        ...(userinfo.family_name ? { lastName: userinfo.family_name } : {}),
      };

      done(null, { user, identityProviderId: state.identityProviderId });
    } catch (err) {
      done(err);
    }
  };
}
