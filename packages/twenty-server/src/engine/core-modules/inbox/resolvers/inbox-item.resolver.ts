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
  InboxQueueDTO,
} from 'src/engine/core-modules/inbox/dtos/inbox-item.dto';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';
import { InboxQueueAssignment } from 'src/engine/core-modules/inbox/enums/inbox-queue-assignment.enum';
import { InboxGraphqlApiExceptionFilter } from 'src/engine/core-modules/inbox/filters/inbox-graphql-api-exception.filter';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemActionService } from 'src/engine/core-modules/inbox/services/inbox-item-action.service';
import {
  type InboxReadScope,
  InboxItemService,
} from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
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

// Every operation is scoped to what the caller can reach by construction: their
// own items, plus the queues they belong to. Both come from the auth context,
// never from the request.
// NoPermissionGuard: the inbox needs no permission flag because reachability is
// decided by assignment and queue access rather than by object permissions.
@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, NoPermissionGuard)
@UseFilters(AuthGraphqlApiExceptionFilter, InboxGraphqlApiExceptionFilter)
export class InboxItemResolver {
  constructor(
    private readonly inboxItemService: InboxItemService,
    private readonly inboxItemActionService: InboxItemActionService,
    private readonly inboxQueueService: InboxQueueService,
    private readonly inboxTransitionService: InboxTransitionService,
  ) {}

  @Query(() => [InboxItemDTO])
  async myInboxItems(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('scope', { type: () => InboxItemScope, nullable: true })
    scope?: InboxItemScope,
    // Naming a queue reads that shared inbox instead of the caller's own
    @Args('queueSlug', { type: () => String, nullable: true })
    queueSlug?: string,
    // Only read for a queue. Defaults to what nobody has taken, which is the
    // question a shared inbox is opened to answer.
    @Args('assignment', { type: () => InboxQueueAssignment, nullable: true })
    assignment?: InboxQueueAssignment,
    // The client grows this to reach older items, so nothing falls off the
    // end of the list without a way back to it.
    @Args('limit', { type: () => Int, nullable: true })
    limit?: number,
  ): Promise<InboxItemDTO[]> {
    const now = new Date();
    const inboxItems = await this.inboxItemService.findMany({
      workspaceId,
      actorUserWorkspaceId: userWorkspaceId,
      readScope: await this.resolveReadScope({
        workspaceId,
        userWorkspaceId,
        queueSlug,
        assignment,
      }),
      scope: scope ?? InboxItemScope.INBOX,
      now,
      limit,
    });

    return inboxItems.map((inboxItem) =>
      toInboxItemDto(inboxItem, now, userWorkspaceId),
    );
  }

  // Looked up by id rather than by scope, so a surface showing one item keeps
  // showing it after a transition moves it out of the scope it came from
  @Query(() => InboxItemDTO, { nullable: true })
  async myInboxItem(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemId', { type: () => UUIDScalarType }) inboxItemId: string,
  ): Promise<InboxItemDTO | null> {
    const inboxItem = await this.inboxItemService.findVisibleItem({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId: userWorkspaceId,
      accessibleQueueIds: await this.inboxQueueService.findAccessibleQueueIds({
        workspaceId,
        userWorkspaceId,
      }),
    });

    return isDefined(inboxItem)
      ? toInboxItemDto(inboxItem, new Date(), userWorkspaceId)
      : null;
  }

  @Query(() => InboxCountsDTO)
  async myInboxCounts(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('queueSlug', { type: () => String, nullable: true })
    queueSlug?: string,
    @Args('assignment', { type: () => InboxQueueAssignment, nullable: true })
    assignment?: InboxQueueAssignment,
  ): Promise<InboxCountsDTO> {
    return this.inboxItemService.countByScope({
      workspaceId,
      actorUserWorkspaceId: userWorkspaceId,
      readScope: await this.resolveReadScope({
        workspaceId,
        userWorkspaceId,
        queueSlug,
        assignment,
      }),
      now: new Date(),
    });
  }

  // The shared inboxes this person can reach, badged the same way their own is
  @Query(() => [InboxQueueDTO])
  async myInboxQueues(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<InboxQueueDTO[]> {
    const now = new Date();
    const queues = await this.inboxQueueService.findAccessibleQueues({
      workspaceId,
      userWorkspaceId,
    });

    return Promise.all(
      queues.map(async (queue) => {
        const counts = await this.inboxItemService.countByScope({
          workspaceId,
          actorUserWorkspaceId: userWorkspaceId,
          // The badge is what the team still has to pick up. Counting items a
          // teammate already took would make it grow as work gets claimed.
          readScope: {
            kind: 'queue',
            queueId: queue.id,
            assignment: InboxQueueAssignment.UNASSIGNED,
          },
          now,
          shouldCountSnoozed: false,
        });

        return {
          id: queue.id,
          name: queue.name,
          slug: queue.slug,
          icon: queue.icon,
          unread: counts.unread,
          needsAction: counts.needsAction,
        };
      }),
    );
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
      actorUserWorkspaceId: userWorkspaceId,
      accessibleQueueIds: await this.inboxQueueService.findAccessibleQueueIds({
        workspaceId,
        userWorkspaceId,
      }),
    });

    return toInboxItemDto(inboxItem, new Date(), userWorkspaceId);
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
      accessibleQueueIds: await this.inboxQueueService.findAccessibleQueueIds({
        workspaceId,
        userWorkspaceId,
      }),
      transition: toInboxItemTransition(transition),
      expectedVersion,
    });

    return toInboxItemDto(inboxItem, new Date(), userWorkspaceId);
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
      accessibleQueueIds: await this.inboxQueueService.findAccessibleQueueIds({
        workspaceId,
        userWorkspaceId,
      }),
      actionKey,
      input: toInboxItemPayload(input),
      expectedVersion,
    });

    return toInboxItemDto(inboxItem, new Date(), userWorkspaceId);
  }

  // Reading a queue you do not belong to is indistinguishable from reading one
  // that does not exist, so access is resolved before the scope is built.
  private async resolveReadScope({
    workspaceId,
    userWorkspaceId,
    queueSlug,
    assignment,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    queueSlug?: string;
    assignment?: InboxQueueAssignment;
  }): Promise<InboxReadScope> {
    if (!isDefined(queueSlug)) {
      return { kind: 'personal' };
    }

    const queue = await this.inboxQueueService.findAccessibleQueueBySlug({
      workspaceId,
      userWorkspaceId,
      slug: queueSlug,
    });

    if (!isDefined(queue)) {
      throw new InboxException(
        `Unknown inbox queue ${queueSlug}`,
        InboxExceptionCode.UNKNOWN_INBOX_QUEUE,
      );
    }

    return {
      kind: 'queue',
      queueId: queue.id,
      assignment: assignment ?? InboxQueueAssignment.UNASSIGNED,
    };
  }
}
