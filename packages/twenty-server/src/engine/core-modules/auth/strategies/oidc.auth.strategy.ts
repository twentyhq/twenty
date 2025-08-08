/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { type Request } from 'express';
import { Strategy, type StrategyOptions, type TokenSet } from 'openid-client';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

export type OIDCRequest = Omit<
  Request,
  'user' | 'workspace' | 'workspaceMetadataVersion'
> & {
  user: {
    identityProviderId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    workspaceInviteHash?: string;
  };
};

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async authenticate(req: Request, options: any) {
    return super.authenticate(req, {
      ...options,
      state: JSON.stringify({
        identityProviderId: req.params.identityProviderId,
        ...(req.query.workspaceInviteHash
          ? { workspaceInviteHash: req.query.workspaceInviteHash }
          : {}),
      }),
    });
  }

  private extractState(req: Request): {
    identityProviderId: string;
    workspaceInviteHash?: string;
  } {
    try {
      const state = JSON.parse(
        req.query.state && typeof req.query.state === 'string'
          ? req.query.state
          : '{}',
      );

      if (!state.identityProviderId) {
        throw new Error();
      }

      return {
        identityProviderId: state.identityProviderId,
        workspaceInviteHash: state.workspaceInviteHash,
      };
    } catch {
      throw new AuthException('Invalid state', AuthExceptionCode.INVALID_INPUT);
    }
  }

  async validate(
    req: Request,
    tokenset: TokenSet,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (err: any, user?: OIDCRequest['user']) => void,
  ) {
    try {
      const state = this.extractState(req);

      const userinfo = await this.client.userinfo(tokenset);

      const email = userinfo.email ?? userinfo.upn;

      if (!email || typeof email !== 'string') {
        return done(
          new AuthException(
            'Email not found in identity provider payload',
            AuthExceptionCode.INVALID_DATA,
          ),
        );
      }

      done(null, {
        email,
        workspaceInviteHash: state.workspaceInviteHash,
        identityProviderId: state.identityProviderId,
        ...(userinfo.given_name ? { firstName: userinfo.given_name } : {}),
        ...(userinfo.family_name ? { lastName: userinfo.family_name } : {}),
      });
    } catch (err) {
      done(err);
    }
  }
}
