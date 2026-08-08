import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Int, Mutation, Query } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { isDefined } from 'twenty-shared/utils';

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
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { TransitionInboxItemInput } from 'src/engine/core-modules/inbox/dtos/transition-inbox-item.input';
import { toInboxItemDto } from 'src/engine/core-modules/inbox/utils/to-inbox-item-dto.util';
import { toInboxItemPayload } from 'src/engine/core-modules/inbox/utils/to-inbox-item-payload.util';
import { toInboxItemTransition } from 'src/engine/core-modules/inbox/utils/to-inbox-item-transition.util';
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
    private readonly inboxTransitionService: InboxTransitionService,
  ) {}

  @Query(() => [InboxItemDTO])
  async myInboxItems(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('scope', { type: () => InboxItemScope, nullable: true })
    scope?: InboxItemScope,
    // The client grows this to reach older items, so nothing falls off the
    // end of the list without a way back to it.
    @Args('limit', { type: () => Int, nullable: true })
    limit?: number,
  ): Promise<InboxItemDTO[]> {
    const now = new Date();
    const inboxItems = await this.inboxItemService.findMany({
      workspaceId,
      assigneeUserWorkspaceId: userWorkspaceId,
      scope: scope ?? InboxItemScope.INBOX,
      now,
      limit,
    });

    return inboxItems.map((inboxItem) => toInboxItemDto(inboxItem, now));
  }

  // Looked up by id rather than by scope, so a surface showing one item keeps
  // showing it after a transition moves it out of the scope it came from
  @Query(() => InboxItemDTO, { nullable: true })
  async myInboxItem(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemId', { type: () => UUIDScalarType }) inboxItemId: string,
  ): Promise<InboxItemDTO | null> {
    const inboxItem = await this.inboxItemService.findOwnedItem({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId: userWorkspaceId,
    });

    return isDefined(inboxItem) ? toInboxItemDto(inboxItem, new Date()) : null;
  }

  @Query(() => InboxCountsDTO)
  async myInboxCounts(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InboxCountsDTO> {
    return this.inboxItemService.countByScope({
      workspaceId,
      assigneeUserWorkspaceId: userWorkspaceId,
      now: new Date(),
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

    return toInboxItemDto(inboxItem, new Date());
  }

  @Mutation(() => InboxItemDTO)
  async transitionInboxItem(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemId', { type: () => UUIDScalarType }) inboxItemId: string,
    @Args('transition', { type: () => TransitionInboxItemInput })
    transition: TransitionInboxItemInput,
    // Omitted means "apply regardless"; a client that acted on what it read
    // should always send back the version it saw
    @Args('expectedVersion', { type: () => Int, nullable: true })
    expectedVersion?: number,
  ): Promise<InboxItemDTO> {
    const inboxItem = await this.inboxTransitionService.transition({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId: userWorkspaceId,
      transition: toInboxItemTransition(transition),
      expectedVersion,
    });

    return toInboxItemDto(inboxItem, new Date());
  }

  // Ergonomic wrapper: names one of the type's declared actions instead of
  // spelling out the transition it stands for.
  @Mutation(() => InboxItemDTO)
  async executeInboxItemAction(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemId', { type: () => UUIDScalarType }) inboxItemId: string,
    @Args('actionKey', { type: () => String }) actionKey: string,
    @Args('input', { type: () => GraphQLJSON, nullable: true })
    input?: Record<string, unknown>,
    @Args('expectedVersion', { type: () => Int, nullable: true })
    expectedVersion?: number,
  ): Promise<InboxItemDTO> {
    const inboxItem = await this.inboxItemActionService.execute({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId: userWorkspaceId,
      actionKey,
      input: toInboxItemPayload(input),
      expectedVersion,
    });

    return toInboxItemDto(inboxItem, new Date());
  }
}
