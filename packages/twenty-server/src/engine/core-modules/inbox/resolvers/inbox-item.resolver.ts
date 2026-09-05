import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Int, Mutation, Query } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import {
  InboxCountsDTO,
  InboxItemDTO,
  InboxItemToolCallDTO,
  InboxQueueDTO,
} from 'src/engine/core-modules/inbox/dtos/inbox-item.dto';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';
import { InboxQueueAssignment } from 'src/engine/core-modules/inbox/enums/inbox-queue-assignment.enum';
import { InboxGraphqlApiExceptionFilter } from 'src/engine/core-modules/inbox/filters/inbox-graphql-api-exception.filter';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemToolCallService } from 'src/engine/core-modules/inbox/services/inbox-item-tool-call.service';
import {
  type InboxReadScope,
  InboxItemService,
} from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { TransitionInboxItemInput } from 'src/engine/core-modules/inbox/dtos/transition-inbox-item.input';
import {
  toInboxItemDto,
  toInboxItemToolCallDto,
} from 'src/engine/core-modules/inbox/utils/to-inbox-item-dto.util';
import { toInboxItemToolCallInput } from 'src/engine/core-modules/inbox/utils/to-inbox-item-tool-call-input.util';
import { toInboxItemTransition } from 'src/engine/core-modules/inbox/utils/to-inbox-item-transition.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

// Every operation is scoped to what the caller can reach by construction: their
// own items plus the queues they belong to, both taken from the auth context
// and never from the request. NoPermissionGuard because that reachability, not
// an object permission, is what decides access.
@CoreResolver()
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  FeatureFlagGuard,
  NoPermissionGuard,
)
@UseFilters(AuthGraphqlApiExceptionFilter, InboxGraphqlApiExceptionFilter)
@RequireFeatureFlag(FeatureFlagKey.IS_INBOX_ENABLED)
export class InboxItemResolver {
  constructor(
    private readonly inboxItemService: InboxItemService,
    private readonly inboxQueueService: InboxQueueService,
    private readonly inboxTransitionService: InboxTransitionService,
    private readonly inboxItemToolCallService: InboxItemToolCallService,
  ) {}

  @Query(() => [InboxItemDTO])
  async myInboxItems(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('scope', { type: () => InboxItemScope, nullable: true })
    scope?: InboxItemScope,
    @Args('queueSlug', { type: () => String, nullable: true })
    queueSlug?: string,
    // Only read for a queue, where it defaults to what nobody has taken.
    @Args('assignment', { type: () => InboxQueueAssignment, nullable: true })
    assignment?: InboxQueueAssignment,
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
  // showing it after a transition moves it out of the scope it came from.
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
      accessibleQueueIds: await this.findAccessibleQueueIds(
        workspaceId,
        userWorkspaceId,
      ),
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
          // The badge is what the team still has to pick up: counting items a
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
      accessibleQueueIds: await this.findAccessibleQueueIds(
        workspaceId,
        userWorkspaceId,
      ),
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
    // should always send back the version it saw.
    @Args('expectedVersion', { type: () => Int, nullable: true })
    expectedVersion?: number,
  ): Promise<InboxItemDTO> {
    const inboxItem = await this.inboxTransitionService.transition({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId: userWorkspaceId,
      accessibleQueueIds: await this.findAccessibleQueueIds(
        workspaceId,
        userWorkspaceId,
      ),
      transition: toInboxItemTransition(transition),
      expectedVersion,
    });

    return toInboxItemDto(inboxItem, new Date(), userWorkspaceId);
  }

  @Mutation(() => InboxItemToolCallDTO)
  async updateInboxItemToolCallInput(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemToolCallId', { type: () => UUIDScalarType })
    inboxItemToolCallId: string,
    @Args('editedInput', { type: () => GraphQLJSON })
    editedInput: Record<string, unknown>,
  ): Promise<InboxItemToolCallDTO> {
    const toolCall = await this.inboxItemToolCallService.updateInput({
      workspaceId,
      actorUserWorkspaceId: userWorkspaceId,
      accessibleQueueIds: await this.findAccessibleQueueIds(
        workspaceId,
        userWorkspaceId,
      ),
      inboxItemToolCallId,
      editedInput: toInboxItemToolCallInput(editedInput) ?? {},
    });

    return toInboxItemToolCallDto(toolCall);
  }

  @Mutation(() => InboxItemToolCallDTO)
  async setInboxItemToolCallRejected(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemToolCallId', { type: () => UUIDScalarType })
    inboxItemToolCallId: string,
    @Args('isRejected', { type: () => Boolean }) isRejected: boolean,
  ): Promise<InboxItemToolCallDTO> {
    const toolCall = await this.inboxItemToolCallService.setRejected({
      workspaceId,
      actorUserWorkspaceId: userWorkspaceId,
      accessibleQueueIds: await this.findAccessibleQueueIds(
        workspaceId,
        userWorkspaceId,
      ),
      inboxItemToolCallId,
      isRejected,
    });

    return toInboxItemToolCallDto(toolCall);
  }

  // An item with no calls is done by this same mutation, so the client has one
  // verb for doing an item whether or not it carries a plan.
  @Mutation(() => InboxItemDTO)
  async runInboxItemToolCalls(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('inboxItemId', { type: () => UUIDScalarType }) inboxItemId: string,
    @Args('expectedVersion', { type: () => Int, nullable: true })
    expectedVersion?: number,
  ): Promise<InboxItemDTO> {
    const inboxItem = await this.inboxItemToolCallService.runAll({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId: userWorkspaceId,
      accessibleQueueIds: await this.findAccessibleQueueIds(
        workspaceId,
        userWorkspaceId,
      ),
      expectedVersion,
    });

    return toInboxItemDto(inboxItem, new Date(), userWorkspaceId);
  }

  private findAccessibleQueueIds(
    workspaceId: string,
    userWorkspaceId: string,
  ): Promise<string[]> {
    return this.inboxQueueService.findAccessibleQueueIds({
      workspaceId,
      userWorkspaceId,
    });
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
