/* eslint-disable @nx/workspace-inject-workspace-repository */
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AvailableWorkspaceOutput } from 'src/engine/core-modules/auth/dto/available-workspaces.output';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { assert } from 'src/utils/assert';

export class UserWorkspaceService extends TypeOrmQueryService<UserWorkspace> {
  constructor(
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {
    super(userWorkspaceRepository);
  }

  async create(userId: string, workspaceId: string): Promise<UserWorkspace> {
    const userWorkspace = this.userWorkspaceRepository.create({
      userId,
      workspaceId,
    });

    this.workspaceEventEmitter.emitCustomBatchEvent(
      USER_SIGNUP_EVENT_NAME,
      [{ userId }],
      workspaceId,
    );

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
        VALUES ($1, $2, 'System', $3, $4, $5)`,
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
    const objectMetadata = await this.objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular: 'workspaceMember',
      },
    });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'workspaceMember',
      action: DatabaseEventAction.CREATED,
      events: [
        {
          recordId: workspaceMember[0].id,
          objectMetadata,
          properties: {
            after: workspaceMember[0],
          },
        },
      ],
      workspaceId,
    });
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

    await this.workspaceInvitationService.invalidateWorkspaceInvitation(
      workspace.id,
      user.email,
    );

    return user;
  }

  async addUserToWorkspaceByInviteToken(inviteToken: string, user: User) {
    const appToken = await this.workspaceInvitationService.validateInvitation({
      workspacePersonalInviteToken: inviteToken,
      email: user.email,
    });

    await this.workspaceInvitationService.invalidateWorkspaceInvitation(
      appToken.workspace.id,
      user.email,
    );

    return await this.addUserToWorkspace(user, appToken.workspace);
  }

  public async getUserCount(workspaceId: string): Promise<number | undefined> {
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

  async findAvailableWorkspacesByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: [
        'workspaces',
        'workspaces.workspace',
        'workspaces.workspace.workspaceSSOIdentityProviders',
      ],
    });

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException('User not found', AuthExceptionCode.USER_NOT_FOUND),
    );

    return user.workspaces.map<AvailableWorkspaceOutput>((userWorkspace) => ({
      id: userWorkspace.workspaceId,
      displayName: userWorkspace.workspace.displayName,
      subdomain: userWorkspace.workspace.subdomain,
      logo: userWorkspace.workspace.logo,
      sso: userWorkspace.workspace.workspaceSSOIdentityProviders.reduce(
        (acc, identityProvider) =>
          acc.concat(
            identityProvider.status === 'Inactive'
              ? []
              : [
                  {
                    id: identityProvider.id,
                    name: identityProvider.name,
                    issuer: identityProvider.issuer,
                    type: identityProvider.type,
                    status: identityProvider.status,
                  },
                ],
          ),
        [] as AvailableWorkspaceOutput['sso'],
      ),
    }));
  }
}
