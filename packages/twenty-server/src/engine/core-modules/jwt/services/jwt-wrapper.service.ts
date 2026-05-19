import { Injectable } from '@nestjs/common';
import { JwtService, type JwtVerifyOptions } from '@nestjs/jwt';

import { createHash } from 'crypto';

import * as jwt from 'jsonwebtoken';
import { ExtractJwt, type JwtFromRequestFunction } from 'passport-jwt';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  type JwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  JWT_ASYMMETRIC_ALGORITHM,
  JWT_LEGACY_ALGORITHM,
} from 'src/engine/core-modules/jwt/constants/jwt-algorithm.constant';
import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { SigningKeyVerifyCounterService } from 'src/engine/core-modules/jwt/services/signing-key-verify-counter.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { decodeJwtHeader } from 'src/engine/core-modules/jwt/utils/decode-jwt-header.util';
import { decodeJwtPayload } from 'src/engine/core-modules/jwt/utils/decode-jwt-payload.util';
import { isAsymmetricJwtHeader } from 'src/engine/core-modules/jwt/utils/is-asymmetric-jwt-header.util';

type ResolvedVerificationKey = {
  key: string;
  algorithm: typeof JWT_LEGACY_ALGORITHM | typeof JWT_ASYMMETRIC_ALGORITHM;
};

const APP_SECRET_BODY_WORKSPACE_SCHEMA = z.object({
  workspaceId: z.string().min(1),
});

const APP_SECRET_BODY_USER_SCHEMA = z.object({
  userId: z.string().min(1),
});

@Injectable()
export class JwtWrapperService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly jwtKeyManagerService: JwtKeyManagerService,
    private readonly signingKeyVerifyCounterService: SigningKeyVerifyCounterService,
  ) {}

  async signAsyncOrThrow(
    payload: JwtPayload,
    options: { expiresIn: string | number; jwtid?: string },
  ): Promise<string> {
    const signingKey = await this.jwtKeyManagerService.getCurrentSigningKey();

    if (!isDefined(signingKey)) {
      throw new AuthException(
        'No active signing key available to sign asymmetric token',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const signOptions: jwt.SignOptions = {
      expiresIn: options.expiresIn as jwt.SignOptions['expiresIn'],
      algorithm: JWT_ASYMMETRIC_ALGORITHM,
      keyid: signingKey.id,
      ...(isDefined(options.jwtid) ? { jwtid: options.jwtid } : {}),
    };

    return jwt.sign(payload as object, signingKey.privateKeyPem, signOptions);
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

  async resolveVerificationKey(
    rawToken: string,
  ): Promise<ResolvedVerificationKey> {
    const header = decodeJwtHeader(rawToken);

    if (isAsymmetricJwtHeader(header)) {
      const publicKeyPem =
        await this.jwtKeyManagerService.getValidPublicKeyPemById(header.kid);

      if (!isDefined(publicKeyPem)) {
        throw new AuthException(
          'Token invalid.',
          AuthExceptionCode.UNAUTHENTICATED,
        );
      }

      return { key: publicKeyPem, algorithm: JWT_ASYMMETRIC_ALGORITHM };
    }

    const payload = decodeJwtPayload<JwtPayload>(rawToken);

    if (!isDefined(payload)) {
      throw new AuthException(
        'Token invalid.',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    const appSecretBody = this.extractAppSecretBody(payload);

    if (!isDefined(appSecretBody)) {
      throw new AuthException(
        'Invalid token type',
        AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
      );
    }

    return {
      key: this.generateAppSecret(payload.type, appSecretBody),
      algorithm: JWT_LEGACY_ALGORITHM,
    };
  }

  async verifyJwtToken(
    token: string,
    options?: JwtVerifyOptions,
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  ): Promise<any> {
    const header = decodeJwtHeader(token);
    const payload = this.decode<JwtPayload>(token, { json: true });

    if (!isDefined(payload)) {
      throw new AuthException('No payload', AuthExceptionCode.UNAUTHENTICATED);
    }

    const { key, algorithm } = await this.resolveVerificationKey(token);

    try {
      const verified = jwt.verify(token, key, {
        ...options,
        algorithms: [algorithm],
      });

      this.recordVerifyForAlgorithm(algorithm, header);

      return verified;
    } catch (error) {
      // API_KEY tokens created before 12/12/2025 were accidentally signed
      // with ACCESS type instead of API_KEY. Fall back to the legacy ACCESS
      // secret for backward compatibility.
      // See https://github.com/twentyhq/twenty/pull/16504
      if (
        payload.type === JwtTokenTypeEnum.API_KEY &&
        algorithm === JWT_LEGACY_ALGORITHM
      ) {
        const appSecretBody = this.extractAppSecretBody(payload);

        if (isDefined(appSecretBody)) {
          try {
            const verified = jwt.verify(
              token,
              this.generateAppSecret(JwtTokenTypeEnum.ACCESS, appSecretBody),
              { ...options, algorithms: [JWT_LEGACY_ALGORITHM] },
            );

            this.recordVerifyForAlgorithm(JWT_LEGACY_ALGORITHM, header);

            return verified;
          } catch {
            throw this.toAuthException(error);
          }
        }
      }

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

  private recordVerifyForAlgorithm(
    algorithm: ResolvedVerificationKey['algorithm'],
    header: ReturnType<typeof decodeJwtHeader>,
  ): void {
    if (
      algorithm === JWT_ASYMMETRIC_ALGORITHM &&
      isAsymmetricJwtHeader(header)
    ) {
      this.signingKeyVerifyCounterService.recordKidVerify(header.kid);

      return;
    }

    this.signingKeyVerifyCounterService.recordLegacyVerify();
  }

  private extractAppSecretBody(payload: JwtPayload): string | undefined {
    const workspaceParse = APP_SECRET_BODY_WORKSPACE_SCHEMA.safeParse(payload);

    if (workspaceParse.success) {
      return workspaceParse.data.workspaceId;
    }

    const userParse = APP_SECRET_BODY_USER_SCHEMA.safeParse(payload);

    if (userParse.success) {
      return userParse.data.userId;
    }

    return undefined;
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
