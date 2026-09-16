import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { buildInboxItemPartialUpdate } from 'src/engine/core-modules/inbox/utils/build-inbox-item-partial-update.util';
import {
  type InboxItemTransition,
  SELF_ASSIGNMENT,
} from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type TransitionInboxItemArgs = {
  inboxItemId: string;
  workspaceId: string;
  actorUserWorkspaceId: string;
  accessibleQueueIds: string[];
  transition: InboxItemTransition;
  // Omitted means "apply regardless", which is what a producer wants; a UI that
  // read the item should always pass what it read.
  expectedVersion?: number;
  // Passed by a caller that already loaded and authorised the item, so the same
  // row is not read twice for one mutation.
  loadedInboxItem?: InboxItemEntity;
};

@Injectable()
export class InboxTransitionService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
    private readonly inboxItemService: InboxItemService,
    private readonly userWorkspaceService: UserWorkspaceService,
  ) {}

  async transition({
    inboxItemId,
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
    transition,
    expectedVersion,
    loadedInboxItem,
  }: TransitionInboxItemArgs): Promise<InboxItemEntity> {
    const visibleItemArgs = {
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
    };
    const inboxItem =
      loadedInboxItem ??
      (await this.inboxItemService.findVisibleItemOrThrow(visibleItemArgs));

    if (transition.kind === 'ASSIGN') {
      await this.assertRecipientBelongsToWorkspace({
        workspaceId,
        actorUserWorkspaceId,
        toUserWorkspaceId: transition.toUserWorkspaceId,
      });
    }

    // Moving work into an inbox the actor cannot read would put it somewhere
    // they can no longer follow it, so the destination is held to the same
    // reach as everything else they can see.
    if (
      transition.kind === 'MOVE' &&
      isDefined(transition.toQueueId) &&
      !accessibleQueueIds.includes(transition.toQueueId)
    ) {
      throw new InboxException(
        `Inbox queue ${transition.toQueueId} is not one you can reach`,
        InboxExceptionCode.UNKNOWN_INBOX_QUEUE,
      );
    }

    const partialUpdate = buildInboxItemPartialUpdate({
      inboxItem,
      actorUserWorkspaceId,
      transition,
    });

    // A transition that changes nothing must not bump the version either:
    // every client holding the item would have to reload to act on it again.
    if (Object.keys(partialUpdate).length === 0) {
      return this.readItemOrThrow(workspaceId, inboxItemId);
    }

    // The version guard lives in the WHERE clause, so losing the race means
    // updating nothing rather than overwriting the winner.
    const updateResult = await this.inboxItemRepository.update(
      workspaceId,
      {
        ...this.inboxItemService.buildWriteScope({
          inboxItem,
          actorUserWorkspaceId,
          accessibleQueueIds,
        }),
        ...(isDefined(expectedVersion) ? { version: expectedVersion } : {}),
      },
      {
        ...partialUpdate,
        version: () => '"version" + 1',
      },
    );

    if ((updateResult.affected ?? 0) === 0) {
      throw new InboxException(
        `Inbox item ${inboxItemId} changed since it was read`,
        InboxExceptionCode.INBOX_ITEM_CHANGED,
      );
    }

    return this.readItemOrThrow(workspaceId, inboxItemId);
  }

  // Read back by id rather than through the actor's visibility: handing a
  // personal item to someone else has just taken it out of the actor's view.
  private async readItemOrThrow(
    workspaceId: string,
    inboxItemId: string,
  ): Promise<InboxItemEntity> {
    const inboxItem = await this.inboxItemRepository.findOne(workspaceId, {
      where: { id: inboxItemId },
      relations: { toolCalls: true, records: true },
    });

    if (!isDefined(inboxItem)) {
      throw new InboxException(
        `Inbox item ${inboxItemId} not found`,
        InboxExceptionCode.INBOX_ITEM_NOT_FOUND,
      );
    }

    return inboxItem;
  }

  // The recipient is a user workspace id, which the caller could have copied
  // from anywhere, so it has to be a member of this workspace.
  private async assertRecipientBelongsToWorkspace({
    workspaceId,
    actorUserWorkspaceId,
    toUserWorkspaceId,
  }: {
    workspaceId: string;
    actorUserWorkspaceId: string;
    toUserWorkspaceId: string | null | typeof SELF_ASSIGNMENT;
  }): Promise<void> {
    if (
      !isDefined(toUserWorkspaceId) ||
      toUserWorkspaceId === SELF_ASSIGNMENT ||
      toUserWorkspaceId === actorUserWorkspaceId
    ) {
      return;
    }

    const recipient =
      await this.userWorkspaceService.findById(toUserWorkspaceId);

    if (!isDefined(recipient) || recipient.workspaceId !== workspaceId) {
      throw new InboxException(
        `User workspace ${toUserWorkspaceId} is not a member of this workspace`,
        InboxExceptionCode.UNKNOWN_INBOX_RECIPIENT,
      );
    }
  }
}
