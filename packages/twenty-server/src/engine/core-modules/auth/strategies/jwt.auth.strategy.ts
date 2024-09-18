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
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

export type JwtPayload = {
  sub: string;
  workspaceId: string;
  workspaceMemberId?: string;
  jti?: string;
};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly environmentService: EnvironmentService,
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
      secretOrKey: environmentService.get('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthContext> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.workspaceId ?? payload.sub,
    });
    let user: User | null = null;
    let apiKey: ApiKeyWorkspaceEntity | null = null;

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    if (payload.jti) {
      // TODO: Check why it's not working
      // const apiKeyRepository =
      //   await this.twentyORMGlobalManager.getRepositoryForWorkspace<ApiKeyWorkspaceEntity>(
      //     workspace.id,
      //     'apiKey',
      //   );

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
    }

    if (payload.workspaceId) {
      user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new AuthException(
          'User not found',
          AuthExceptionCode.INVALID_INPUT,
        );
      }
    }

    // We don't check if the user is a member of the workspace yet
    const workspaceMemberId = payload.workspaceMemberId;

    return { user, apiKey, workspace, workspaceMemberId };
  }
}
