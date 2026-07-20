import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { msg } from '@lingui/core/macro';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { Repository } from 'typeorm';
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

const hashSSOExchangeToken = (ssoExchangeToken: string) =>
  crypto.createHash('sha256').update(ssoExchangeToken).digest('hex');

// A single opaque error for missing, expired and already-consumed tokens:
// distinguishing them would turn this endpoint into a redemption oracle.
const buildInvalidSSOExchangeTokenException = () =>
  new AuthException(
    'Invalid SSO exchange token',
    AuthExceptionCode.INVALID_INPUT,
    { userFriendlyMessage: msg`Authentication failed, please sign in again.` },
  );

@Injectable()
export class SSOExchangeTokenService {
  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateSSOExchangeToken({
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
        type: AppTokenType.SSOExchangeToken,
        value: hashSSOExchangeToken(plainToken),
        context: { authProvider },
      }),
    );

    return {
      token: plainToken,
      expiresAt,
    };
  }

  async validateAndConsumeSSOExchangeTokenOrThrow(
    ssoExchangeToken: string,
  ): Promise<{ userId: string; authProvider: AuthProviderEnum }> {
    // Claiming the row with a single DELETE ... RETURNING makes redemption
    // atomic: concurrent requests cannot both read it and each mint a token.
    const { raw } = await this.appTokenRepository
      .createQueryBuilder()
      .delete()
      .from(AppTokenEntity)
      .where('value = :value', {
        value: hashSSOExchangeToken(ssoExchangeToken),
      })
      .andWhere('type = :type', { type: AppTokenType.SSOExchangeToken })
      .returning('*')
      .execute();

    const claimedToken: AppTokenEntity | undefined = raw[0];

    if (raw.length !== 1 || !isDefined(claimedToken)) {
      throw buildInvalidSSOExchangeTokenException();
    }

    const { userId, expiresAt, context } = claimedToken;

    if (new Date() > new Date(expiresAt)) {
      throw buildInvalidSSOExchangeTokenException();
    }

    if (!isDefined(userId) || !isDefined(context?.authProvider)) {
      throw buildInvalidSSOExchangeTokenException();
    }

    return { userId, authProvider: context.authProvider };
  }
}
