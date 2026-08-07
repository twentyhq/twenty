import { BadRequestException, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { type InboxItemAction } from 'src/engine/core-modules/inbox/types/inbox-item-action.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const MINUTE_IN_MS = 60 * 1000;
const MAX_SNOOZE_MINUTES = 60 * 24 * 365;

// Dispatches the actions a type declares. The inbox card renders whatever the
// type lists, so a new kind of work needs no new UI.
@Injectable()
export class InboxItemActionService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemTypeEntity)
    private readonly inboxItemTypeRepository: WorkspaceScopedRepository<InboxItemTypeEntity>,
    private readonly inboxItemService: InboxItemService,
  ) {}

  // Declared actions come out of unvalidated jsonb, so the handler is narrowed
  // from a plain kind rather than trusted to match the union.
  async execute({
    inboxItemId,
    workspaceId,
    assigneeUserWorkspaceId,
    actionKey,
  }: {
    inboxItemId: string;
    workspaceId: string;
    assigneeUserWorkspaceId: string;
    actionKey: string;
  }): Promise<InboxItemEntity> {
    const inboxItem = await this.inboxItemService.findOwnedItemOrThrow({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId,
    });

    const action = await this.findActionOrThrow({
      workspaceId,
      inboxItemTypeId: inboxItem.inboxItemTypeId,
      actionKey,
    });

    const ownedItemArgs = {
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId,
    };

    // Captured before the switch narrows it, so the unsupported-kind branch can
    // name a kind the union does not know about
    const declaredKind: string = action.handler.kind;

    switch (action.handler.kind) {
      case 'COMPLETE':
        return this.inboxItemService.complete(ownedItemArgs);
      case 'SNOOZE': {
        const durationMinutes = action.handler.durationMinutes;

        // Durations come from unvalidated jsonb; a bad one would otherwise
        // produce an Invalid Date and hide the item forever
        if (
          !Number.isFinite(durationMinutes) ||
          durationMinutes <= 0 ||
          durationMinutes > MAX_SNOOZE_MINUTES
        ) {
          throw new BadRequestException(
            `Action ${actionKey} declares an invalid snooze duration`,
          );
        }

        return this.inboxItemService.snooze({
          ...ownedItemArgs,
          snoozedUntil: new Date(Date.now() + durationMinutes * MINUTE_IN_MS),
        });
      }
      case 'OPEN_THREAD':
      case 'OPEN_SUBJECT_RECORD':
        throw new BadRequestException(
          `Action ${actionKey} is resolved by the client`,
        );
      default:
        throw new BadRequestException(
          `Action ${actionKey} has unsupported handler kind ${declaredKind}`,
        );
    }
  }

  private async findActionOrThrow({
    workspaceId,
    inboxItemTypeId,
    actionKey,
  }: {
    workspaceId: string;
    inboxItemTypeId: string;
    actionKey: string;
  }): Promise<InboxItemAction> {
    const inboxItemType = await this.inboxItemTypeRepository.findOneBy(
      workspaceId,
      { id: inboxItemTypeId },
    );

    const action = inboxItemType?.actions?.find(
      (declaredAction) => declaredAction.key === actionKey,
    );

    if (!isDefined(action)) {
      throw new BadRequestException(
        `Unknown action ${actionKey} for this inbox item`,
      );
    }

    return action;
  }
}
