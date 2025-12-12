import { Injectable } from '@nestjs/common';
import {
  JwtService,
  type JwtSignOptions,
  type JwtVerifyOptions,
} from '@nestjs/jwt';

import { createHash } from 'crypto';

import { type Request as ExpressRequest } from 'express';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt, type JwtFromRequestFunction } from 'passport-jwt';
import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  type JwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class JwtWrapperService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  sign(payload: JwtPayload, options?: JwtSignOptions): string {
    // Typescript does not handle well the overloads of the sign method, helping it a little bit
    return this.jwtService.sign(payload, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verify<T extends object = any>(
    token: string,
    options?: { secret: string },
  ): T {
    return this.jwtService.verify(token, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decode<T = any>(payload: string, options?: jwt.DecodeOptions): T {
    return this.jwtService.decode(payload, options);
  }

  verifyJwtToken(
    token: string,
    options?: JwtVerifyOptions,
    isLegacyApiKey = false,
  ) {
    const payload = this.decode<JwtPayload>(token, {
      json: true,
    });

    if (!isDefined(payload)) {
      throw new AuthException('No payload', AuthExceptionCode.UNAUTHENTICATED);
    }

    const type = payload.type;

    const appSecretBody =
      'workspaceId' in payload
        ? payload.workspaceId
        : 'userId' in payload
          ? payload.userId
          : undefined;

    if (!isDefined(appSecretBody)) {
      throw new AuthException(
        'Invalid token type',
        AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
      );
    }

    try {
      // Supporting old API KEY tokens
      if (
        !payload.type &&
        !('workspaceId' in payload) &&
        type === JwtTokenTypeEnum.API_KEY
      ) {
        return this.jwtService.verify(token, {
          ...options,
          secret: this.generateAppSecretLegacy(),
        });
      }

      // This is due to an unfortunate mistake in the secret generation of API_KEY
      // tokens. We used to sign with ACCESS Jwt Token Type instead of API_KEY.
      // Now we need to check both cases not to break the existing api keys
      // See this PR for context -> https://github.com/twentyhq/twenty/pull/16504
      // This code block can be deleted, but all api keys created before
      // 12/12/2025 will be broken
      if (type === JwtTokenTypeEnum.API_KEY && !isLegacyApiKey) {
        try {
          return this.jwtService.verify(token, {
            ...options,
            secret: this.generateAppSecret(type, appSecretBody),
          });
        } catch {
          return this.jwtService.verify(token, {
            ...options,
            secret: this.generateAppSecret(
              JwtTokenTypeEnum.ACCESS,
              appSecretBody,
            ),
          });
        }
      }

      return this.jwtService.verify(token, {
        ...options,
        secret: this.generateAppSecret(type, appSecretBody),
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthException(
          'Token has expired.',
          AuthExceptionCode.UNAUTHENTICATED,
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthException(
          'Token invalid.',
          AuthExceptionCode.UNAUTHENTICATED,
        );
      }
      throw new AuthException(
        'Unknown token error.',
        AuthExceptionCode.INVALID_INPUT,
      );
    }
  }

  generateAppSecret(type: JwtTokenTypeEnum, appSecretBody: string): string {
    const appSecret = this.twentyConfigService.get('APP_SECRET');

    if (!appSecret) {
      throw new Error('APP_SECRET is not set');
    }

    return createHash('sha256')
      .update(`${appSecret}${appSecretBody}${type}`)
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
