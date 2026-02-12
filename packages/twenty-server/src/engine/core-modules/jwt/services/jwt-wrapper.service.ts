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

  verifyJwtToken(token: string, options?: JwtVerifyOptions) {
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
      // API_KEY tokens created before 12/12/2025 were accidentally signed
      // with ACCESS type instead of API_KEY. Try the correct secret first,
      // fall back to the old one for backward compatibility.
      // See https://github.com/twentyhq/twenty/pull/16504
      if (type === JwtTokenTypeEnum.API_KEY) {
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
