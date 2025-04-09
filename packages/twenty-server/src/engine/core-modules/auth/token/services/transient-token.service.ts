import { Injectable } from '@nestjs/common';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class TransientTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateTransientToken(
    workspaceMemberId: string,
    userId: string,
    workspaceId: string,
  ): Promise<AuthToken> {
    const secret = this.jwtWrapperService.generateAppSecret(
      'LOGIN',
      workspaceId,
    );
    const expiresIn = this.twentyConfigService.get(
      'SHORT_TERM_TOKEN_EXPIRES_IN',
    );

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    const jwtPayload = {
      sub: workspaceMemberId,
      userId,
      workspaceId,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret,
        expiresIn,
      }),
      expiresAt,
    };
  }

  async verifyTransientToken(transientToken: string): Promise<{
    workspaceMemberId: string;
    userId: string;
    workspaceId: string;
  }> {
    await this.jwtWrapperService.verifyWorkspaceToken(transientToken, 'LOGIN');

    const payload = await this.jwtWrapperService.decode(transientToken);

    return {
      workspaceMemberId: payload.sub,
      userId: payload.userId,
      workspaceId: payload.workspaceId,
    };
  }
}
