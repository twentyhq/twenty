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
import { JwtPayload } from 'src/engine/core-modules/auth/strategies/interfaces';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
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

  async validate(payload: JwtPayload): Promise<AuthContext> {
    // We split in three different cases
    // 1. API_KEY
    // 2. API_KEY - backward compatibility with old api tokens based on
    // no payload.workspaceId and no type
    // 3. all other types of tokens (no backward compatibility)

    let user: User | null = null;
    let apiKey: ApiKeyWorkspaceEntity | null = null;

    let propertyName: 'workspaceId' | 'sub';

    // case 2.
    if (!payload.type && !payload.workspaceId) {
      propertyName = 'sub';
    } else if (payload.type === 'API_KEY') {
      // case 1.
      propertyName = 'sub';
    } else {
      // case 3.
      propertyName = 'workspaceId';
    }

    const workspace = await this.workspaceRepository.findOneBy({
      id: payload[propertyName],
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    // the jti here let us know that this can be revoked. We need to check.
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

    if (payload.type !== 'API_KEY') {
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
