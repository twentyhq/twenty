import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import {
  AuthContext,
  WorkspaceAgnosticTokenJwtPayload,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';

@Injectable()
export class WorkspaceAgnosticTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly jwtStrategy: JwtAuthStrategy,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  async generateWorkspaceAgnosticToken(userId: string): Promise<AuthToken> {
    const expiresIn = this.twentyConfigService.get('ACCESS_TOKEN_EXPIRES_IN');

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException('User is not found', AuthExceptionCode.INVALID_INPUT),
    );

    const jwtPayload: WorkspaceAgnosticTokenJwtPayload = {
      sub: user.id,
      userId: user.id,
      type: 'WORKSPACE_AGNOSTIC',
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret: this.jwtWrapperService.generateAppSecret(
          'WORKSPACE_AGNOSTIC',
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
        await this.jwtWrapperService.decode<WorkspaceAgnosticTokenJwtPayload>(
          token,
        );

      this.jwtWrapperService.verify(token, {
        secret: this.jwtWrapperService.generateAppSecret(
          'WORKSPACE_AGNOSTIC',
          decoded.userId,
        ),
      });

      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
      });

      userValidator.assertIsDefinedOrThrow(user);

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
