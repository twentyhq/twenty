import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-status.enum';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';
import { type InboxItemTransition } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const MAX_DURATION_MINUTES = 60 * 24 * 365;
const DEFAULT_CLAIM_LEASE_MINUTES = 30;

export type TransitionInboxItemArgs = {
  inboxItemId: string;
  workspaceId: string;
  actorUserWorkspaceId: string;
  transition: InboxItemTransition;
  // Optimistic concurrency. Omitted means "apply regardless", which is what a
  // producer wants; a UI that read the item should always pass what it read.
  expectedVersion?: number;
};

// Every change to an inbox item goes through here. Specialised mutations wrap
// this for ergonomics, but there is one place where an item changes state.
@Injectable()
export class InboxTransitionService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
    private readonly inboxItemService: InboxItemService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async transition({
    inboxItemId,
    workspaceId,
    actorUserWorkspaceId,
    transition,
    expectedVersion,
  }: TransitionInboxItemArgs): Promise<InboxItemEntity> {
    if (transition.kind === 'REASSIGN') {
      await this.assertTargetIsInWorkspace({
        workspaceId,
        targetUserWorkspaceId: transition.targetUserWorkspaceId,
      });
    }

    const inboxItem = await this.inboxItemService.findOwnedItemOrThrow({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId: actorUserWorkspaceId,
    });

    const partialUpdate = this.buildPartialUpdate({
      inboxItem,
      actorUserWorkspaceId,
      transition,
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
      { ...partialUpdate, version: () => '"version" + 1' },
    );

    if (updateResult.affected === 0) {
      throw new ConflictException(
        `Inbox item ${inboxItemId} changed since it was read`,
      );
    }

    // A reassigned item now belongs to the target, so reading it back as the
    // actor would report "not found" for a write that succeeded
    return this.inboxItemService.findOwnedItemOrThrow({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId:
        transition.kind === 'REASSIGN'
          ? transition.targetUserWorkspaceId
          : actorUserWorkspaceId,
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
      case 'CLAIM':
        this.assertOpen(inboxItem, transition.kind);

        return {
          claimedByUserWorkspaceId: actorUserWorkspaceId,
          claimExpiresAt: this.addMinutes(
            now,
            this.readDuration(
              transition.leaseDurationMinutes ?? DEFAULT_CLAIM_LEASE_MINUTES,
            ),
          ),
          readAt: now,
        };

      case 'RELEASE':
        return { claimedByUserWorkspaceId: null, claimExpiresAt: null };

      case 'REASSIGN':
        this.assertOpen(inboxItem, transition.kind);

        return {
          assigneeUserWorkspaceId: transition.targetUserWorkspaceId,
          // The new assignee has not seen it, and inherits no claim
          readAt: null,
          claimedByUserWorkspaceId: null,
          claimExpiresAt: null,
        };

      case 'RESOLVE':
        this.assertOpen(inboxItem, transition.kind);

        return {
          status: InboxItemStatus.RESOLVED,
          outcome: this.readOutcome(inboxItem, transition.outcome),
          result: this.readResult(transition.result),
          resolvedAt: now,
          resolvedByUserWorkspaceId: actorUserWorkspaceId,
          readAt: now,
          snoozedUntil: null,
          claimedByUserWorkspaceId: null,
          claimExpiresAt: null,
        };

      case 'CANCEL':
        this.assertOpen(inboxItem, transition.kind);

        return {
          status: InboxItemStatus.CANCELLED,
          cancellationReason: transition.reason ?? null,
          resolvedAt: now,
          resolvedByUserWorkspaceId: actorUserWorkspaceId,
          snoozedUntil: null,
          claimedByUserWorkspaceId: null,
          claimExpiresAt: null,
        };

      case 'SNOOZE':
        this.assertOpen(inboxItem, transition.kind);

        return {
          snoozedUntil: this.addMinutes(
            now,
            this.readDuration(transition.durationMinutes),
          ),
          readAt: now,
        };

      case 'REOPEN':
        if (inboxItem.status === InboxItemStatus.OPEN) {
          throw new BadRequestException(
            'Cannot REOPEN an inbox item that is already open',
          );
        }

        return {
          status: InboxItemStatus.OPEN,
          outcome: null,
          result: null,
          cancellationReason: null,
          resolvedAt: null,
          resolvedByUserWorkspaceId: null,
          snoozedUntil: null,
          // A reopened item is asking for attention again
          readAt: null,
        };
    }
  }

  // Reads are scoped by workspace and assignee together, so handing an item to
  // someone outside the workspace would make it unreachable rather than moved
  private async assertTargetIsInWorkspace({
    workspaceId,
    targetUserWorkspaceId,
  }: {
    workspaceId: string;
    targetUserWorkspaceId: string;
  }): Promise<void> {
    const target = await this.userWorkspaceRepository.findOne({
      where: { id: targetUserWorkspaceId, workspaceId },
    });

    if (!isDefined(target)) {
      throw new BadRequestException(
        'Cannot reassign an inbox item outside the workspace',
      );
    }
  }

  private assertOpen(inboxItem: InboxItemEntity, kind: string): void {
    if (inboxItem.status !== InboxItemStatus.OPEN) {
      throw new BadRequestException(
        `Cannot ${kind} an inbox item that is already ${inboxItem.status.toLowerCase()}`,
      );
    }
  }

  // The type decides which outcomes exist. A type that declares none accepts
  // any, so a producer can resolve an item it fully controls.
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

  private readResult(
    result: InboxItemPayload | undefined,
  ): InboxItemPayload | null {
    return isDefined(result) ? result : null;
  }

  private readDuration(durationMinutes: number): number {
    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes <= 0 ||
      durationMinutes > MAX_DURATION_MINUTES
    ) {
      throw new BadRequestException(
        `Duration must be between 1 and ${MAX_DURATION_MINUTES} minutes`,
      );
    }

    return durationMinutes;
  }

  private addMinutes(from: Date, minutes: number): Date {
    return new Date(from.getTime() + minutes * 60 * 1000);
  }
}
