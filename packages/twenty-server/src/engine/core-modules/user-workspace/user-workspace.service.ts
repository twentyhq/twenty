/* eslint-disable @nx/workspace-inject-workspace-repository */
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { assert } from 'src/utils/assert';

export class UserWorkspaceService extends TypeOrmQueryService<UserWorkspace> {
  constructor(
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private workspaceEventEmitter: WorkspaceEventEmitter,
  ) {
    super(userWorkspaceRepository);
  }

  async create(userId: string, workspaceId: string): Promise<UserWorkspace> {
    const userWorkspace = this.userWorkspaceRepository.create({
      userId,
      workspaceId,
    });

    const payload = new ObjectRecordCreateEvent<UserWorkspace>();

    payload.userId = userId;

    this.workspaceEventEmitter.emit('user.signup', [payload], workspaceId);

    return this.userWorkspaceRepository.save(userWorkspace);
  }

  async createWorkspaceMember(workspaceId: string, user: User) {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."workspaceMember"
        ("nameFirstName", "nameLastName", "colorScheme", "userId", "userEmail", "avatarUrl")
        VALUES ($1, $2, 'Light', $3, $4, $5)`,
      [
        user.firstName,
        user.lastName,
        user.id,
        user.email,
        user.defaultAvatarUrl ?? '',
      ],
    );
    const workspaceMember = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "userId"='${user.id}'`,
    );

    assert(
      workspaceMember.length === 1,
      `Error while creating workspace member ${user.email} on workspace ${workspaceId}`,
    );
    const payload =
      new ObjectRecordCreateEvent<WorkspaceMemberWorkspaceEntity>();

    payload.properties = {
      after: workspaceMember[0],
    };
    payload.recordId = workspaceMember[0].id;

    this.workspaceEventEmitter.emit(
      'workspaceMember.created',
      [payload],
      workspaceId,
    );
  }

  async addUserToWorkspace(user: User, workspace: Workspace) {
    const userWorkspaceExists = await this.checkUserWorkspaceExists(
      user.id,
      workspace.id,
    );

    if (!userWorkspaceExists) {
      await this.create(user.id, workspace.id);

      await this.createWorkspaceMember(workspace.id, user);
    }

    return await this.userRepository.save({
      id: user.id,
      defaultWorkspace: workspace,
      updatedAt: new Date().toISOString(),
    });
  }

  async validateInvitation(inviteToken: string, email: string) {
    const appToken = await this.appTokenRepository.findOne({
      where: {
        value: inviteToken,
        type: AppTokenType.InvitationToken,
      },
      relations: ['workspace'],
    });

    if (!appToken) {
      throw new Error('Invalid invitation token');
    }

    if (appToken.context?.email !== email) {
      throw new Error('Email does not match the invitation');
    }

    if (new Date(appToken.expiresAt) < new Date()) {
      throw new Error('Invitation expired');
    }

    return appToken;
  }

  async addUserToWorkspaceByInviteToken(inviteToken: string, user: User) {
    const appToken = await this.validateInvitation(inviteToken, user.email);

    await this.workspaceInvitationService.invalidateWorkspaceInvitation(
      appToken.workspace.id,
      user.email,
    );

    return await this.addUserToWorkspace(user, appToken.workspace);
  }

  public async getUserCount(workspaceId): Promise<number | undefined> {
    return await this.userWorkspaceRepository.countBy({
      workspaceId,
    });
  }

  async checkUserWorkspaceExists(
    userId: string,
    workspaceId: string,
  ): Promise<UserWorkspace | null> {
    return this.userWorkspaceRepository.findOneBy({
      userId,
      workspaceId,
    });
  }

  async checkUserWorkspaceExistsByEmail(email: string, workspaceId: string) {
    return this.userWorkspaceRepository.exists({
      where: {
        workspaceId,
        user: {
          email,
        },
      },
      relations: {
        user: true,
      },
    });
  }
}
