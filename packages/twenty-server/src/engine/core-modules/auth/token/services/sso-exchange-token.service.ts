import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { msg } from '@lingui/core/macro';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { IsNull, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

const hashSsoExchangeToken = (ssoExchangeToken: string) =>
  crypto.createHash('sha256').update(ssoExchangeToken).digest('hex');

// One opaque error for every failure, or this endpoint becomes a redemption oracle
const buildInvalidSsoExchangeTokenException = () =>
  new AuthException(
    'Invalid SSO exchange token',
    AuthExceptionCode.INVALID_INPUT,
    { userFriendlyMessage: msg`Authentication failed, please sign in again.` },
  );

@Injectable()
export class SsoExchangeTokenService {
  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateSsoExchangeToken({
    userId,
    authProvider,
  }: {
    userId: string;
    authProvider: AuthProviderEnum;
  }): Promise<AuthToken> {
    const expiresIn = this.twentyConfigService.get(
      'SHORT_TERM_TOKEN_EXPIRES_IN',
    );
    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const plainToken = crypto.randomBytes(32).toString('hex');

    await this.appTokenRepository.save(
      this.appTokenRepository.create({
        userId,
        expiresAt,
        type: AppTokenType.SsoExchangeToken,
        value: hashSsoExchangeToken(plainToken),
        context: { authProvider },
      }),
    );

    return {
      token: plainToken,
      expiresAt,
    };
  }

  async validateAndConsumeSsoExchangeTokenOrThrow(
    ssoExchangeToken: string,
  ): Promise<{ userId: string; authProvider: AuthProviderEnum }> {
    const appToken = await this.appTokenRepository.findOneBy({
      value: hashSsoExchangeToken(ssoExchangeToken),
      type: AppTokenType.SsoExchangeToken,
      revokedAt: IsNull(),
      deletedAt: IsNull(),
    });

    if (!isDefined(appToken)) {
      throw buildInvalidSsoExchangeTokenException();
    }

    // The delete is the single-use claim; rechecking revokedAt/deletedAt keeps it atomic with revocation
    const { affected } = await this.appTokenRepository.delete({
      id: appToken.id,
      revokedAt: IsNull(),
      deletedAt: IsNull(),
    });

    if (affected !== 1) {
      throw buildInvalidSsoExchangeTokenException();
    }

    if (new Date() > appToken.expiresAt) {
      throw buildInvalidSsoExchangeTokenException();
    }

    if (
      !isDefined(appToken.userId) ||
      !isDefined(appToken.context?.authProvider)
    ) {
      throw buildInvalidSsoExchangeTokenException();
    }

    return {
      userId: appToken.userId,
      authProvider: appToken.context.authProvider,
    };
  }
}
