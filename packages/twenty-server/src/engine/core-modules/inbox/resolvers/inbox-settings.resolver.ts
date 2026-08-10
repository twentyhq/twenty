import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import {
  InboxItemTypeSettingsDTO,
  InboxQueueSettingsDTO,
} from 'src/engine/core-modules/inbox/dtos/inbox-queue-settings.dto';
import {
  CreateInboxQueueInput,
  SetInboxItemTypeDefaultQueueInput,
  SetInboxQueueRolesInput,
  UpdateInboxQueueInput,
} from 'src/engine/core-modules/inbox/dtos/inbox-queue-settings.input';
import { InboxGraphqlApiExceptionFilter } from 'src/engine/core-modules/inbox/filters/inbox-graphql-api-exception.filter';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { type InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { type InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

const toInboxItemTypeSettingsDto = (
  inboxItemType: InboxItemTypeEntity,
): InboxItemTypeSettingsDTO => ({
  id: inboxItemType.id,
  key: inboxItemType.key,
  label: inboxItemType.label,
  icon: inboxItemType.icon,
  defaultQueueId: inboxItemType.defaultQueueId,
});

// Administering shared inboxes decides who can read whose work, so it sits
// behind the workspace settings permission rather than behind the access it
// grants, the way reading an item does.
@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  FeatureFlagGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
@UseFilters(AuthGraphqlApiExceptionFilter, InboxGraphqlApiExceptionFilter)
export class InboxSettingsResolver {
  constructor(
    private readonly inboxQueueService: InboxQueueService,
    private readonly inboxItemTypeService: InboxItemTypeService,
  ) {}

  @Query(() => [InboxQueueSettingsDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_INBOX_ENABLED)
  async inboxQueueSettings(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<InboxQueueSettingsDTO[]> {
    const [queues, roleIdsByQueue] = await Promise.all([
      this.inboxQueueService.findAllQueues({ workspaceId: workspace.id }),
      this.inboxQueueService.findQueueRoleIdsByQueue({
        workspaceId: workspace.id,
      }),
    ]);

    return queues.map((queue) =>
      this.toDto(queue, roleIdsByQueue.get(queue.id) ?? []),
    );
  }

  @Mutation(() => InboxQueueSettingsDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_INBOX_ENABLED)
  async createInboxQueue(
    @Args('input') input: CreateInboxQueueInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<InboxQueueSettingsDTO> {
    const queue = await this.inboxQueueService.createQueue({
      workspaceId: workspace.id,
      name: input.name,
      icon: input.icon,
      roleIds: input.roleIds ?? [],
    });

    return this.readQueueSettings(workspace.id, queue);
  }

  @Mutation(() => InboxQueueSettingsDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_INBOX_ENABLED)
  async updateInboxQueue(
    @Args('input') input: UpdateInboxQueueInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<InboxQueueSettingsDTO> {
    const queue = await this.inboxQueueService.updateQueue({
      workspaceId: workspace.id,
      queueId: input.queueId,
      name: input.name,
      icon: input.icon,
    });

    return this.readQueueSettings(workspace.id, queue);
  }

  @Mutation(() => InboxQueueSettingsDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_INBOX_ENABLED)
  async setInboxQueueRoles(
    @Args('input') input: SetInboxQueueRolesInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<InboxQueueSettingsDTO> {
    await this.inboxQueueService.setQueueRoles({
      workspaceId: workspace.id,
      queueId: input.queueId,
      roleIds: input.roleIds,
    });

    const queue = await this.inboxQueueService.findQueueOrThrow({
      workspaceId: workspace.id,
      queueId: input.queueId,
    });

    return this.readQueueSettings(workspace.id, queue);
  }

  @Mutation(() => Boolean)
  @RequireFeatureFlag(FeatureFlagKey.IS_INBOX_ENABLED)
  async deleteInboxQueue(
    @Args('queueId', { type: () => UUIDScalarType }) queueId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.inboxQueueService.deleteQueue({
      workspaceId: workspace.id,
      queueId,
    });

    return true;
  }

  @Query(() => [InboxItemTypeSettingsDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_INBOX_ENABLED)
  async inboxItemTypeSettings(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<InboxItemTypeSettingsDTO[]> {
    const inboxItemTypes = await this.inboxItemTypeService.findAllForSettings({
      workspaceId: workspace.id,
    });

    return inboxItemTypes.map(toInboxItemTypeSettingsDto);
  }

  @Mutation(() => InboxItemTypeSettingsDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_INBOX_ENABLED)
  async setInboxItemTypeDefaultQueue(
    @Args('input') input: SetInboxItemTypeDefaultQueueInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<InboxItemTypeSettingsDTO> {
    const inboxItemType = await this.inboxItemTypeService.setDefaultQueue({
      workspaceId: workspace.id,
      inboxItemTypeId: input.inboxItemTypeId,
      defaultQueueId: input.defaultQueueId ?? null,
    });

    return toInboxItemTypeSettingsDto(inboxItemType);
  }

  private async readQueueSettings(
    workspaceId: string,
    queue: InboxQueueEntity,
  ): Promise<InboxQueueSettingsDTO> {
    const roleIdsByQueue = await this.inboxQueueService.findQueueRoleIdsByQueue(
      { workspaceId },
    );

    return this.toDto(queue, roleIdsByQueue.get(queue.id) ?? []);
  }

  private toDto(
    queue: InboxQueueEntity,
    roleIds: string[],
  ): InboxQueueSettingsDTO {
    return {
      id: queue.id,
      name: queue.name,
      slug: queue.slug,
      icon: queue.icon,
      isDefault: queue.isDefault,
      roleIds,
    };
  }
}
