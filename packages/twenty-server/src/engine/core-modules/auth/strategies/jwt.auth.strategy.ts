import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  AuthContext,
  JwtPayload,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {
    const jwtFromRequestFunction = jwtWrapperService.extractJwtFromRequest();
    const secretOrKeyProviderFunction = async (request, rawJwtToken, done) => {
      try {
        const decodedToken = jwtWrapperService.decode(
          rawJwtToken,
        ) as JwtPayload;
        const workspaceId = decodedToken.workspaceId;
        const secret = jwtWrapperService.generateAppSecret(
          'ACCESS',
          workspaceId,
        );

        done(null, secret);
      } catch (error) {
        done(error, null);
      }
    };

    super({
      jwtFromRequest: jwtFromRequestFunction,
      ignoreExpiration: false,
      secretOrKeyProvider: secretOrKeyProviderFunction,
    });
  }

  private async validateAPIKey(payload: JwtPayload): Promise<AuthContext> {
    let apiKey: ApiKeyWorkspaceEntity | null = null;

    const workspace = await this.workspaceRepository.findOneBy({
      id: payload['sub'],
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspace.id,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const res = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."apiKey" WHERE id = $1`,
      [payload.jti],
    );

    apiKey = res?.[0];

    if (!apiKey || apiKey.revokedAt) {
      throw new AuthException(
        'This API Key is revoked',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return { apiKey, workspace };
  }

  private async validateAccessToken(payload: JwtPayload): Promise<AuthContext> {
    let user: User | null = null;
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload['workspaceId'],
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.USER_NOT_FOUND,
      );
    }

    if (!payload.userWorkspaceId) {
      throw new AuthException(
        'UserWorkspace not found',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        id: payload.userWorkspaceId,
      },
    });

    if (!userWorkspace) {
      throw new AuthException(
        'UserWorkspace not found',
        AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
      );
    }

    return { user, workspace, userWorkspaceId: userWorkspace.id };
  }

  async validate(payload: JwtPayload): Promise<AuthContext> {
    const workspaceMemberId = payload.workspaceMemberId;

    if (!payload.type && !payload.workspaceId) {
      return { ...(await this.validateAPIKey(payload)), workspaceMemberId };
    }

    if (payload.type === 'API_KEY') {
      return { ...(await this.validateAPIKey(payload)), workspaceMemberId };
    }

    return { ...(await this.validateAccessToken(payload)), workspaceMemberId };
  }
}
