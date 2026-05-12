import { Injectable } from '@nestjs/common';
import {
  JwtService,
  type JwtSignOptions,
  type JwtVerifyOptions,
} from '@nestjs/jwt';

import { createHash } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
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
import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const ASYMMETRIC_TOKEN_TYPES: ReadonlySet<JwtTokenTypeEnum> = new Set([
  JwtTokenTypeEnum.ACCESS,
  JwtTokenTypeEnum.REFRESH,
]);

const isAsymmetricSigningEligible = (type: JwtTokenTypeEnum): boolean =>
  ASYMMETRIC_TOKEN_TYPES.has(type);

@Injectable()
export class JwtWrapperService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly jwtKeyManagerService: JwtKeyManagerService,
  ) {}

  sign(payload: JwtPayload, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }

  async signAsync(
    payload: JwtPayload,
    options: { expiresIn: string | number; jwtid?: string },
  ): Promise<string> {
    if (!isAsymmetricSigningEligible(payload.type)) {
      throw new AuthException(
        `signAsync called with non-rotatable token type "${payload.type}"`,
        AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
      );
    }

    const asymmetric = await this.signAsymmetric(payload, options);

    if (isDefined(asymmetric)) {
      return asymmetric;
    }

    return this.signWithAppSecret(payload, options);
  }

  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  verify<T extends object = any>(
    token: string,
    options?: { secret: string },
  ): T {
    return this.jwtService.verify(token, options);
  }

  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  decode<T = any>(payload: string, options?: jwt.DecodeOptions): T {
    return this.jwtService.decode(payload, options);
  }

  async verifyJwtToken(token: string, options?: JwtVerifyOptions) {
    const payload = this.decode<JwtPayload>(token, {
      json: true,
    });

    if (!isDefined(payload)) {
      throw new AuthException('No payload', AuthExceptionCode.UNAUTHENTICATED);
    }

    const decodedHeader = this.tryDecodeHeader(token);

    if (this.shouldVerifyAsymmetric({ header: decodedHeader, payload })) {
      return this.verifyJwtTokenWithSigningKeyId({
        token,
        signingKeyId: decodedHeader!.kid as string,
        options,
      });
    }

    const type = payload.type;

    const appSecretBody = this.extractAppSecretBody(payload);

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
            algorithms: ['HS256'],
            secret: this.generateAppSecret(type, appSecretBody),
          });
        } catch {
          return this.jwtService.verify(token, {
            ...options,
            algorithms: ['HS256'],
            secret: this.generateAppSecret(
              JwtTokenTypeEnum.ACCESS,
              appSecretBody,
            ),
          });
        }
      }

      return this.jwtService.verify(token, {
        ...options,
        algorithms: ['HS256'],
        secret: this.generateAppSecret(type, appSecretBody),
      });
    } catch (error) {
      throw this.toAuthException(error);
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
    return ExtractJwt.fromAuthHeaderAsBearerToken();
  }

  private async signAsymmetric(
    payload: JwtPayload,
    options: { expiresIn: string | number; jwtid?: string },
  ): Promise<string | null> {
    const signingKey = await this.jwtKeyManagerService.getCurrentSigningKey();

    if (!isDefined(signingKey)) {
      return null;
    }

    return jwt.sign(payload as object, signingKey.privateKey, {
      ...options,
      algorithm: 'ES256',
      keyid: signingKey.id,
    } as jwt.SignOptions);
  }

  private signWithAppSecret(
    payload: JwtPayload,
    options: { expiresIn: string | number; jwtid?: string },
  ): string {
    const appSecretBody = this.extractAppSecretBody(payload);

    if (!isDefined(appSecretBody)) {
      throw new AuthException(
        'Cannot derive HS256 secret: payload missing workspaceId or userId',
        AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
      );
    }

    return this.jwtService.sign(payload, {
      ...options,
      secret: this.generateAppSecret(payload.type, appSecretBody),
    });
  }

  private extractAppSecretBody(payload: JwtPayload): string | undefined {
    if ('workspaceId' in payload && isNonEmptyString(payload.workspaceId)) {
      return payload.workspaceId;
    }

    if ('userId' in payload && isNonEmptyString(payload.userId)) {
      return payload.userId;
    }

    return undefined;
  }

  private shouldVerifyAsymmetric(args: {
    header: jwt.JwtHeader | undefined;
    payload: JwtPayload;
  }): boolean {
    const signingKeyId = args.header?.kid;
    const alg = args.header?.alg;

    if (!isNonEmptyString(signingKeyId)) {
      return false;
    }

    if (alg !== 'ES256') {
      return false;
    }

    return isAsymmetricSigningEligible(args.payload.type);
  }

  private async verifyJwtTokenWithSigningKeyId(args: {
    token: string;
    signingKeyId: string;
    options?: JwtVerifyOptions;
  }) {
    const publicKey = await this.jwtKeyManagerService.getValidPublicKeyById(
      args.signingKeyId,
    );

    if (!isDefined(publicKey)) {
      throw new AuthException(
        'Token invalid.',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    try {
      return jwt.verify(args.token, publicKey, {
        ...args.options,
        algorithms: ['ES256'],
      });
    } catch (error) {
      throw this.toAuthException(error);
    }
  }

  private tryDecodeHeader(token: string): jwt.JwtHeader | undefined {
    try {
      const decoded = jwt.decode(token, { complete: true });

      if (!isDefined(decoded)) {
        return undefined;
      }

      return decoded.header;
    } catch {
      return undefined;
    }
  }

  private toAuthException(error: unknown): AuthException {
    if (error instanceof jwt.TokenExpiredError) {
      return new AuthException(
        'Token has expired.',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return new AuthException(
        'Token invalid.',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    return new AuthException(
      'Unknown token error.',
      AuthExceptionCode.INVALID_INPUT,
    );
  }
}
