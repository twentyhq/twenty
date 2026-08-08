import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { type InboxItemTransition } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const MAX_RESURFACE_MINUTES = 60 * 24 * 365;

export type TransitionInboxItemArgs = {
  inboxItemId: string;
  workspaceId: string;
  actorUserWorkspaceId: string;
  transition: InboxItemTransition;
  // Optimistic concurrency. Omitted means "apply regardless", which is what a
  // producer wants; a UI that read the item should always pass what it read.
  expectedVersion?: number;
};

// The assignee's side of the item. Producers write through the router; nothing
// else writes these columns, which is what keeps the two apart.
@Injectable()
export class InboxTransitionService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
    private readonly inboxItemService: InboxItemService,
  ) {}

  async transition({
    inboxItemId,
    workspaceId,
    actorUserWorkspaceId,
    transition,
    expectedVersion,
  }: TransitionInboxItemArgs): Promise<InboxItemEntity> {
    const inboxItem = await this.inboxItemService.findOwnedItemOrThrow({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId: actorUserWorkspaceId,
    });

    // The version guard lives in the WHERE clause, so losing the race means
    // updating nothing rather than overwriting the winner
    const updateResult = await this.inboxItemRepository.update(
      workspaceId,
      {
        id: inboxItem.id,
        assigneeUserWorkspaceId: actorUserWorkspaceId,
        ...(isDefined(expectedVersion) ? { version: expectedVersion } : {}),
      },
      {
        ...this.buildPartialUpdate({
          inboxItem,
          actorUserWorkspaceId,
          transition,
        }),
        version: () => '"version" + 1',
      },
    );

    if (updateResult.affected === 0) {
      throw new ConflictException(
        `Inbox item ${inboxItemId} changed since it was read`,
      );
    }

    return this.inboxItemService.findOwnedItemOrThrow({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId: actorUserWorkspaceId,
    });
  }

  private buildPartialUpdate({
    inboxItem,
    actorUserWorkspaceId,
    transition,
  }: {
    inboxItem: InboxItemEntity;
    actorUserWorkspaceId: string;
    transition: InboxItemTransition;
  }): QueryDeepPartialEntity<InboxItemEntity> {
    const now = new Date();

    switch (transition.kind) {
      case 'CLEAR':
        return {
          clearedAt: now,
          clearedByUserWorkspaceId: actorUserWorkspaceId,
          resurfaceAt: isDefined(transition.resurfaceInMinutes)
            ? this.addMinutes(now, transition.resurfaceInMinutes)
            : null,
          outcome: isDefined(transition.outcome)
            ? this.readOutcome(inboxItem, transition.outcome)
            : null,
          result: transition.result ?? null,
          // Clearing something means having seen it
          readAt: now,
        };

      case 'REOPEN':
        return {
          clearedAt: null,
          clearedByUserWorkspaceId: null,
          resurfaceAt: null,
          outcome: null,
          result: null,
        };
    }
  }

  // The type decides which outcomes exist. A type that declares none accepts
  // any, so a producer can clear an item it fully controls.
  private readOutcome(inboxItem: InboxItemEntity, outcome: string): string {
    const declaredOutcomes = inboxItem.inboxItemType?.resolution?.outcomes;

    if (!isDefined(declaredOutcomes) || declaredOutcomes.length === 0) {
      return outcome;
    }

    const isDeclared = declaredOutcomes.some(
      (declaredOutcome) => declaredOutcome.key === outcome,
    );

    if (!isDeclared) {
      throw new BadRequestException(
        `Unknown outcome ${outcome} for inbox item type ${inboxItem.inboxItemType.key}`,
      );
    }

    return outcome;
  }

  private addMinutes(from: Date, minutes: number): Date {
    if (
      !Number.isFinite(minutes) ||
      minutes <= 0 ||
      minutes > MAX_RESURFACE_MINUTES
    ) {
      throw new BadRequestException(
        `Resurfacing must be between 1 and ${MAX_RESURFACE_MINUTES} minutes away`,
      );
    }

    return new Date(from.getTime() + minutes * 60 * 1000);
  }
}
