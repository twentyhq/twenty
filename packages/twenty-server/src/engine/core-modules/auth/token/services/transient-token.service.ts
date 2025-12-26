import { Injectable } from '@nestjs/common';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  type TransientTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';

@Injectable()
export class TransientTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateTransientToken({
    workspaceMemberId,
    workspaceId,
    userId,
  }: Omit<TransientTokenJwtPayload, 'type' | 'sub'>): Promise<AuthToken> {
    const jwtPayload: TransientTokenJwtPayload = {
      sub: workspaceMemberId,
      userId: userId,
      workspaceId: workspaceId,
      workspaceMemberId: workspaceMemberId,
      type: JwtTokenTypeEnum.LOGIN,
    };

    const secret = this.jwtWrapperService.generateAppSecret(
      jwtPayload.type,
      workspaceId,
    );
    const expiresIn = this.twentyConfigService.get(
      'SHORT_TERM_TOKEN_EXPIRES_IN',
    );

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret,
        expiresIn,
      }),
      expiresAt,
    };
  }

  async verifyTransientToken(
    transientToken: string,
  ): Promise<Omit<TransientTokenJwtPayload, 'type' | 'sub'>> {
    await this.jwtWrapperService.verifyJwtToken(transientToken);

    const { type: _type, ...payload } =
      this.jwtWrapperService.decode<TransientTokenJwtPayload>(transientToken);

    return payload;
  }
}
