import { Injectable } from '@nestjs/common';

import { ApiKeyToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';

@Injectable()
export class ApiKeyService {
  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  async generateApiKeyToken(
    workspaceId: string,
    apiKeyId?: string,
    expiresAt?: Date | string,
  ): Promise<Pick<ApiKeyToken, 'token'> | undefined> {
    if (!apiKeyId) {
      return;
    }
    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.ACCESS,
      workspaceId,
    );
    let expiresIn: string | number;

    if (expiresAt) {
      expiresIn = Math.floor(
        (new Date(expiresAt).getTime() - new Date().getTime()) / 1000,
      );
    } else {
      expiresIn = '100y';
    }
    const token = this.jwtWrapperService.sign(
      {
        sub: workspaceId,
        type: JwtTokenTypeEnum.API_KEY,
        workspaceId,
      },
      {
        secret,
        expiresIn,
        jwtid: apiKeyId,
      },
    );

    return { token };
  }
}
