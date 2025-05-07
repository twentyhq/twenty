import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

import { createHash } from 'crypto';

import { Request as ExpressRequest } from 'express';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type WorkspaceTokenType =
  | 'ACCESS'
  | 'LOGIN'
  | 'REFRESH'
  | 'FILE'
  | 'POSTGRES_PROXY'
  | 'REMOTE_SERVER'
  | 'API_KEY';

@Injectable()
export class JwtWrapperService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  sign(payload: string | object, options?: JwtSignOptions): string {
    // Typescript does not handle well the overloads of the sign method, helping it a little bit
    if (typeof payload === 'object') {
      return this.jwtService.sign(payload, options);
    }

    return this.jwtService.sign(payload, options);
  }

  verify<T extends object = any>(token: string, options?: JwtVerifyOptions): T {
    return this.jwtService.verify(token, options);
  }

  decode<T = any>(payload: string, options?: jwt.DecodeOptions): T {
    return this.jwtService.decode(payload, options);
  }

  verifyWorkspaceToken(
    token: string,
    type: WorkspaceTokenType,
    options?: JwtVerifyOptions,
  ) {
    const payload = this.decode(token, {
      json: true,
    });

    if (!isDefined(payload)) {
      throw new AuthException('No payload', AuthExceptionCode.UNAUTHENTICATED);
    }

    // TODO: check if this is really needed
    if (type !== 'FILE' && !payload.sub) {
      throw new AuthException(
        'No payload sub',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    try {
      // TODO: Deprecate this once old API KEY tokens are no longer in use
      if (!payload.type && !payload.workspaceId && type === 'ACCESS') {
        return this.jwtService.verify(token, {
          ...options,
          secret: this.generateAppSecretLegacy(),
        });
      }

      return this.jwtService.verify(token, {
        ...options,
        secret: this.generateAppSecret(type, payload.workspaceId),
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthException(
          'Token has expired.',
          AuthExceptionCode.UNAUTHENTICATED,
        );
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthException(
          'Token invalid.',
          AuthExceptionCode.UNAUTHENTICATED,
        );
      } else {
        throw new AuthException(
          'Unknown token error.',
          AuthExceptionCode.INVALID_INPUT,
        );
      }
    }
  }

  generateAppSecret(type: WorkspaceTokenType, workspaceId?: string): string {
    const appSecret = this.twentyConfigService.get('APP_SECRET');

    if (!appSecret) {
      throw new Error('APP_SECRET is not set');
    }

    return createHash('sha256')
      .update(`${appSecret}${workspaceId}${type}`)
      .digest('hex');
  }

  generateAppSecretLegacy(): string {
    const accessTokenSecret = this.twentyConfigService.get(
      'ACCESS_TOKEN_SECRET',
    );

    if (!accessTokenSecret) {
      throw new Error('ACCESS_TOKEN_SECRET is not set');
    }

    return accessTokenSecret;
  }

  extractJwtFromRequest(): JwtFromRequestFunction {
    return (request: ExpressRequest) => {
      // First try to extract token from Authorization header
      const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

      if (tokenFromHeader) {
        return tokenFromHeader;
      }

      // If not found in header, try to extract from URL query parameter
      // This is for edge cases where we don't control the origin request
      // (e.g. the REST API playground)
      return ExtractJwt.fromUrlQueryParameter('token')(request);
    };
  }
}
