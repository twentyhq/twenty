import { Injectable } from '@nestjs/common';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import {
  type AuthContext,
  JwtTokenTypeEnum,
  type WorkspaceAgnosticTokenJwtPayload,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';

@Injectable()
export class WorkspaceAgnosticTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userService: UserService,
  ) {}

  async generateWorkspaceAgnosticToken({
    userId,
    authProvider,
  }: {
    userId: string;
    authProvider: WorkspaceAgnosticTokenJwtPayload['authProvider'];
  }): Promise<AuthToken> {
    const expiresIn = this.twentyConfigService.get(
      'WORKSPACE_AGNOSTIC_TOKEN_EXPIRES_IN',
    );

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const user = await this.userService.findUserByIdOrThrow(
      userId,
      new AuthException('User is not found', AuthExceptionCode.INVALID_INPUT),
    );

    const jwtPayload: WorkspaceAgnosticTokenJwtPayload = {
      sub: user.id,
      userId: user.id,
      authProvider,
      type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret(
          JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
          user.id,
        ),
        expiresIn,
      }),
      expiresAt,
    };
  }

  async validateToken(token: string): Promise<AuthContext> {
    try {
      const decoded =
        this.jwtWrapperService.decode<WorkspaceAgnosticTokenJwtPayload>(token);

      this.jwtWrapperService.verify(token, {
        secret: this.jwtWrapperService.generateAppSecret(
          JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
          decoded.userId,
        ),
      });

      const user = await this.userService.findUserByIdOrThrow(decoded.sub);

      return { user };
    } catch (error) {
      if (error instanceof AuthException) {
        throw error;
      }

      throw new AuthException(
        'Invalid token',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }
  }
}
