import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import {
  InboxCountsDTO,
  InboxItemDTO,
} from 'src/engine/core-modules/inbox/dtos/inbox-item.dto';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';
import { InboxItemActionService } from 'src/engine/core-modules/inbox/services/inbox-item-action.service';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { toInboxItemDto } from 'src/engine/core-modules/inbox/utils/to-inbox-item-dto.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

// Every operation is scoped to the caller's own items by construction: the
// assignee is taken from the auth context, never from the request.
// NoPermissionGuard: the inbox needs no permission flag because a member can
// only ever reach their own items, never anybody else's.
@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class InboxItemResolver {
  constructor(
    private readonly inboxItemService: InboxItemService,
    private readonly inboxItemActionService: InboxItemActionService,
  ) {}

  @Query(() => [InboxItemDTO])
  async myInboxItems(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('scope', { type: () => InboxItemScope, nullable: true })
    scope?: InboxItemScope,
  ): Promise<InboxItemDTO[]> {
    const inboxItems = await this.inboxItemService.findMany({
      workspaceId,
      assigneeUserWorkspaceId: userWorkspaceId,
      scope: scope ?? InboxItemScope.INBOX,
    });

    return inboxItems.map(toInboxItemDto);
  }

  @Query(() => InboxCountsDTO)
  async myInboxCounts(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InboxCountsDTO> {
    return this.inboxItemService.countByScope({
      workspaceId,
      assigneeUserWorkspaceId: userWorkspaceId,
    });
  }

  @Mutation(() => InboxItemDTO)
  async markInboxItemRead(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemId', { type: () => UUIDScalarType }) inboxItemId: string,
  ): Promise<InboxItemDTO> {
    const inboxItem = await this.inboxItemService.markRead({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId: userWorkspaceId,
    });

    return toInboxItemDto(inboxItem);
  }

  @Mutation(() => InboxItemDTO)
  async snoozeInboxItem(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemId', { type: () => UUIDScalarType }) inboxItemId: string,
    @Args('snoozedUntil', { type: () => Date }) snoozedUntil: Date,
  ): Promise<InboxItemDTO> {
    const inboxItem = await this.inboxItemService.snooze({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId: userWorkspaceId,
      snoozedUntil,
    });

    return toInboxItemDto(inboxItem);
  }

  @Mutation(() => InboxItemDTO)
  async completeInboxItem(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemId', { type: () => UUIDScalarType }) inboxItemId: string,
  ): Promise<InboxItemDTO> {
    const inboxItem = await this.inboxItemService.complete({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId: userWorkspaceId,
    });

    return toInboxItemDto(inboxItem);
  }

  @Mutation(() => InboxItemDTO)
  async reopenInboxItem(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemId', { type: () => UUIDScalarType }) inboxItemId: string,
  ): Promise<InboxItemDTO> {
    const inboxItem = await this.inboxItemService.reopen({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId: userWorkspaceId,
    });

    return toInboxItemDto(inboxItem);
  }

  @Mutation(() => InboxItemDTO)
  async executeInboxItemAction(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemId', { type: () => UUIDScalarType }) inboxItemId: string,
    @Args('actionKey', { type: () => String }) actionKey: string,
  ): Promise<InboxItemDTO> {
    const inboxItem = await this.inboxItemActionService.execute({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId: userWorkspaceId,
      actionKey,
    });

    return toInboxItemDto(inboxItem);
  }
}
