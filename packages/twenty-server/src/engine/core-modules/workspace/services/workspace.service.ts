import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { DEFAULT_FEATURE_FLAGS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/default-feature-flags';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkspaceService extends TypeOrmQueryService<Workspace> {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly environmentService: EnvironmentService,
  ) {
    super(workspaceRepository);
  }

  async updateWorkspaceById(payload: Partial<Workspace> & { id: string }) {
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.id,
    });

    workspaceValidator.assertIsExist(
      workspace,
      new WorkspaceException(
        'Workspace not found',
        WorkspaceExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    if (payload.subdomain && workspace.subdomain !== payload.subdomain) {
      const subdomainAvailable = await this.isSubdomainAvailable(
        payload.subdomain,
      );

      if (
        !subdomainAvailable ||
        this.environmentService.get('DEFAULT_SUBDOMAIN') === payload.subdomain
      ) {
        throw new WorkspaceException(
          'Subdomain already taken',
          WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN,
        );
      }
    }

    return this.workspaceRepository.save({
      ...workspace,
      ...payload,
    });
  }

  async activateWorkspace(user: User, data: ActivateWorkspaceInput) {
    if (!data.displayName || !data.displayName.length) {
      throw new BadRequestException("'displayName' not provided");
    }

    const existingWorkspace = await this.workspaceRepository.findOneBy({
      id: user.defaultWorkspaceId,
    });

    if (!existingWorkspace) {
      throw new Error('Workspace not found');
    }

    if (
      existingWorkspace.activationStatus ===
      WorkspaceActivationStatus.ONGOING_CREATION
    ) {
      throw new Error('Workspace is already being created');
    }

    if (
      existingWorkspace.activationStatus !==
      WorkspaceActivationStatus.PENDING_CREATION
    ) {
      throw new Error('Workspace is not pending creation');
    }

    await this.workspaceRepository.update(user.defaultWorkspaceId, {
      activationStatus: WorkspaceActivationStatus.ONGOING_CREATION,
    });

    await this.featureFlagService.enableFeatureFlags(
      DEFAULT_FEATURE_FLAGS,
      user.defaultWorkspaceId,
    );

    await this.workspaceManagerService.init(user.defaultWorkspaceId);
    await this.userWorkspaceService.createWorkspaceMember(
      user.defaultWorkspaceId,
      user,
    );

    await this.workspaceRepository.update(user.defaultWorkspaceId, {
      displayName: data.displayName,
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    });

    return await this.workspaceRepository.findOneBy({
      id: user.defaultWorkspaceId,
    });
  }

  async softDeleteWorkspace(id: string) {
    const workspace = await this.workspaceRepository.findOneBy({ id });

    assert(workspace, 'Workspace not found');

    await this.userWorkspaceRepository.delete({ workspaceId: id });
    await this.billingSubscriptionService.deleteSubscription(workspace.id);

    await this.workspaceManagerService.delete(id);

    return workspace;
  }

  async deleteWorkspace(id: string) {
    const userWorkspaces = await this.userWorkspaceRepository.findBy({
      workspaceId: id,
    });

    const workspace = await this.softDeleteWorkspace(id);

    for (const userWorkspace of userWorkspaces) {
      await this.handleRemoveWorkspaceMember(id, userWorkspace.userId);
    }

    await this.workspaceRepository.delete(id);

    return workspace;
  }

  async handleRemoveWorkspaceMember(workspaceId: string, userId: string) {
    await this.userWorkspaceRepository.delete({
      userId,
      workspaceId,
    });
    await this.reassignOrRemoveUserDefaultWorkspace(workspaceId, userId);
  }

  private async reassignOrRemoveUserDefaultWorkspace(
    workspaceId: string,
    userId: string,
  ) {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId: userId },
    });

    if (userWorkspaces.length === 0) {
      await this.userRepository.delete({ id: userId });

      return;
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error(`User ${userId} not found in workspace ${workspaceId}`);
    }

    if (user.defaultWorkspaceId === workspaceId) {
      await this.userRepository.update(
        { id: userId },
        {
          defaultWorkspaceId: userWorkspaces[0].workspaceId,
        },
      );
    }
  }

  async isSubdomainAvailable(subdomain: string) {
    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { subdomain: subdomain },
    });

    return !existingWorkspace;
  }
}
