import { Injectable } from '@nestjs/common';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  LoginTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

@Injectable()
export class TwoFactorAuthenticationPendingTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async verifyLoginToken(loginToken: string): Promise<{
    sub: string;
    workspaceId: string;
    authProvider: AuthProviderEnum;
    pending2FA: boolean;
  }> {
    await this.jwtWrapperService.verifyJwtToken(
      loginToken,
      JwtTokenTypeEnum.LOGIN,
    );

    return this.jwtWrapperService.decode(loginToken, {
      json: true,
    });
  }
}
