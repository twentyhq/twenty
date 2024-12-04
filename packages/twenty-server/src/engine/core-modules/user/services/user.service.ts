import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class UserService extends TypeOrmQueryService<User> {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly workspaceService: WorkspaceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(userRepository);
  }

  async loadWorkspaceMember(user: User, workspace: Workspace) {
    if (workspace?.activationStatus !== WorkspaceActivationStatus.ACTIVE) {
      return null;
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspace.id,
        'workspaceMember',
      );

    return await workspaceMemberRepository.findOne({
      where: {
        userId: user.id,
      },
    });
  }

  async loadWorkspaceMembers(workspace: Workspace) {
    if (workspace.activationStatus !== WorkspaceActivationStatus.ACTIVE) {
      return [];
    }

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspace.id,
        'workspaceMember',
      );

    return workspaceMemberRepository.find();
  }

  async deleteUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['defaultWorkspace'],
    });

    assert(user, 'User not found');

    const workspaceId = user.defaultWorkspaceId;

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const workspaceMembers = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember"`,
    );
    const workspaceMember = workspaceMembers.filter(
      (member: WorkspaceMemberWorkspaceEntity) => member.userId === userId,
    )?.[0];

    assert(workspaceMember, 'WorkspaceMember not found');

    if (workspaceMembers.length === 1) {
      await this.workspaceService.deleteWorkspace(workspaceId);

      return user;
    }

    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "userId" = '${userId}'`,
    );

    const objectMetadata = await this.objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular: 'workspaceMember',
      },
    });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'workspaceMember',
      action: DatabaseEventAction.DELETED,
      events: [
        {
          recordId: workspaceMember.id,
          objectMetadata,
          properties: {
            before: workspaceMember,
          },
        },
      ],
      workspaceId,
    });

    return user;
  }

  async hasUserAccessToWorkspaceOrThrow(userId: string, workspaceId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        workspaces: {
          workspaceId,
        },
      },
      relations: ['workspaces'],
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException(
        'User does not have access to this workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );
  }

  async saveDefaultWorkspaceIfUserHasAccessOrThrow(
    userId: string,
    workspaceId: string,
  ) {
    await this.hasUserAccessToWorkspaceOrThrow(userId, workspaceId);

    return await this.userRepository.save({
      id: userId,
      defaultWorkspaceId: workspaceId,
    });
  }
}
