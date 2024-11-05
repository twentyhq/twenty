import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { ExtractJwt, Strategy } from 'passport-jwt';
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
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const decodedToken = this.jwtWrapperService.decode(
            rawJwtToken,
          ) as JwtPayload;
          const workspaceId = decodedToken.workspaceId;
          const secret = this.jwtWrapperService.generateAppSecret(
            'ACCESS',
            workspaceId,
          );

          done(null, secret);
        } catch (error) {
          done(error, null);
        }
      },
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
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    return { user, workspace };
  }

  async validate(payload: JwtPayload): Promise<AuthContext> {
    let user: User | null = null;
    let workspace: Workspace | null;
    let apiKey: ApiKeyWorkspaceEntity | null = null;

    if (!payload.type && !payload.workspaceId) {
      const { apiKey: _apiKey, workspace: _workspace } =
        await this.validateAPIKey(payload);

      workspace = _workspace;
      apiKey = _apiKey || null;
    } else if (payload.type === 'API_KEY') {
      const { apiKey: _apiKey, workspace: _workspace } =
        await this.validateAPIKey(payload);

      workspace = _workspace;
      apiKey = _apiKey || null;
    } else {
      const { user: _user, workspace: _workspace } =
        await this.validateAccessToken(payload);

      workspace = _workspace;
      user = _user || null;
    }

    // We don't check if the user is a member of the workspace yet
    const workspaceMemberId = payload.workspaceMemberId;

    return { user, apiKey, workspace, workspaceMemberId };
  }
}
