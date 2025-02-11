import { Injectable, UseGuards } from '@nestjs/common';

import { SettingsFeatures } from 'twenty-shared';

import { ApiKeyToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly environmentService: EnvironmentService,
  ) {}

  @UseGuards(SettingsPermissionsGuard(SettingsFeatures.API_KEYS_AND_WEBHOOKS))
  async generateApiKeyToken(
    workspaceId: string,
    apiKeyId?: string,
    expiresAt?: Date | string,
  ): Promise<Pick<ApiKeyToken, 'token'> | undefined> {
    if (!apiKeyId) {
      return;
    }
    const jwtPayload = {
      sub: workspaceId,
      type: 'API_KEY',
      workspaceId,
    };
    const secret = this.jwtWrapperService.generateAppSecret(
      'ACCESS',
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
    const token = this.jwtWrapperService.sign(jwtPayload, {
      secret,
      expiresIn,
      jwtid: apiKeyId,
    });

    return { token };
  }
}
