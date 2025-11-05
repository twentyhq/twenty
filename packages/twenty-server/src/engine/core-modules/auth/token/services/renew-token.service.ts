import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

@Injectable()
export class RenewTokenService {
  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceAgnosticTokenService: WorkspaceAgnosticTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async generateTokensFromRefreshToken(token: string): Promise<{
    accessOrWorkspaceAgnosticToken: AuthToken;
    refreshToken: AuthToken;
  }> {
    if (!token) {
      throw new AuthException(
        'Refresh token not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const {
      user,
      token: { id, workspaceId },
      authProvider,
      targetedTokenType: targetedTokenTypeFromPayload,
      isImpersonating,
      impersonatorUserWorkspaceId,
      impersonatedUserWorkspaceId,
    } = await this.refreshTokenService.verifyRefreshToken(token);

    // Revoke old refresh token
    await this.appTokenRepository.update(
      {
        id,
      },
      {
        revokedAt: new Date(),
      },
    );

    // Support legacy token when targetedTokenType is undefined.
    const targetedTokenType =
      targetedTokenTypeFromPayload ?? JwtTokenTypeEnum.ACCESS;

    const resolvedAuthProvider = authProvider ?? AuthProviderEnum.Password;

    const accessToken =
      isDefined(authProvider) &&
      targetedTokenType === JwtTokenTypeEnum.WORKSPACE_AGNOSTIC &&
      !isDefined(workspaceId)
        ? await this.workspaceAgnosticTokenService.generateWorkspaceAgnosticToken(
            {
              userId: user.id,
              authProvider,
            },
          )
        : await this.accessTokenService.generateAccessToken({
            userId: user.id,
            workspaceId: workspaceId as string,
            authProvider: resolvedAuthProvider,
            isImpersonating,
            impersonatorUserWorkspaceId,
            impersonatedUserWorkspaceId,
          });

    const refreshToken = await this.refreshTokenService.generateRefreshToken({
      userId: user.id,
      workspaceId,
      authProvider: resolvedAuthProvider,
      targetedTokenType,
      isImpersonating,
      impersonatorUserWorkspaceId,
      impersonatedUserWorkspaceId,
    });

    return {
      accessOrWorkspaceAgnosticToken: accessToken,
      refreshToken,
    };
  }
}
