import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { WorkspaceAgnosticTokenService } from 'src/engine/core-modules/auth/token/services/workspace-agnostic-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { acquireUserAuthenticationLock } from 'src/engine/core-modules/auth/utils/acquire-user-authentication-lock.util';
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

    // Support legacy token when targetedTokenType is undefined.
    const targetedTokenType =
      targetedTokenTypeFromPayload ?? JwtTokenTypeEnum.ACCESS;

    const resolvedAuthProvider = authProvider ?? AuthProviderEnum.Password;

    const refreshToken = await this.appTokenRepository.manager.transaction(
      async (entityManager) => {
        await acquireUserAuthenticationLock({
          entityManager,
          userId: user.id,
          mode: 'shared',
        });

        const appTokenRepository = entityManager.getRepository(AppTokenEntity);

        // A security revocation committed after the first read must still stop this renewal
        const lockedToken = await appTokenRepository.findOneBy({ id });

        if (
          !isDefined(lockedToken) ||
          isDefined(lockedToken.context?.revokedReason)
        ) {
          throw new AuthException(
            'This refresh token has been revoked.',
            AuthExceptionCode.FORBIDDEN_EXCEPTION,
          );
        }

        // Revoke old refresh token only if not already revoked.
        // If it was already revoked (concurrent race condition within grace
        // period), we preserve the original revokedAt timestamp so the grace
        // window stays anchored and cannot be extended by repeated reuse.
        await appTokenRepository.update(
          {
            id,
            revokedAt: IsNull(),
          },
          {
            revokedAt: new Date(),
          },
        );

        return await this.refreshTokenService.generateRefreshToken(
          {
            userId: user.id,
            workspaceId,
            authProvider: resolvedAuthProvider,
            targetedTokenType,
            isImpersonating,
            impersonatorUserWorkspaceId,
            impersonatedUserWorkspaceId,
          },
          false,
          entityManager,
        );
      },
    );

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

    return {
      accessOrWorkspaceAgnosticToken: accessToken,
      refreshToken,
    };
  }
}
