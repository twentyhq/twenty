import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { IsNull, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  ExternalEventException,
  ExternalEventExceptionCode,
} from 'src/engine/core-modules/external-event/external-event.exception';

export type ExternalEventToken = {
  token: string;
  expiresAt: Date;
};

@Injectable()
export class ExternalEventTokenService {
  private readonly logger = new Logger(ExternalEventTokenService.name);

  constructor(
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
  ) {}

  async createToken(
    userId: string,
    workspaceId: string,
  ): Promise<ExternalEventToken> {
    try {
      const expiresIn = '3650d';
      const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

      const plainToken = crypto.randomBytes(32).toString('hex');

      const hashedToken = crypto
        .createHash('sha256')
        .update(plainToken)
        .digest('hex');

      const externalEventToken = this.appTokenRepository.create({
        id: uuidv4(),
        userId,
        workspaceId,
        type: AppTokenType.ExternalEventToken,
        value: hashedToken,
        expiresAt,
      });

      await this.appTokenRepository.save(externalEventToken);

      // Return only the plain token and expiration date
      // After this point, the plain token cannot be retrieved again
      return {
        token: plainToken,
        expiresAt,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create external event token: ${error.message}`,
        error.stack,
      );
      throw new ExternalEventException(
        'Failed to create external event token',
        ExternalEventExceptionCode.TOKEN_CREATION_ERROR,
      );
    }
  }

  /**
   * Validate an external event token
   */
  async validateToken(
    workspaceId: string,
    providedToken: string,
  ): Promise<boolean> {
    try {
      // Hash the provided token for comparison
      const hashedToken = crypto
        .createHash('sha256')
        .update(providedToken)
        .digest('hex');

      const appToken = await this.appTokenRepository.findOne({
        where: {
          workspaceId,
          value: hashedToken,
          type: AppTokenType.ExternalEventToken,
          revokedAt: IsNull(),
          deletedAt: IsNull(),
        },
      });

      if (!appToken) {
        return false;
      }

      // Check if token is expired
      if (new Date() > appToken.expiresAt) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Error validating external event token: ${error.message}`,
        error.stack,
      );

      return false;
    }
  }
}
