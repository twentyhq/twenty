import { BadRequestException, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import {
  CLIENT_RESOLVED_ACTION_KINDS,
  type InboxItemAction,
  type InboxItemActionHandler,
} from 'src/engine/core-modules/inbox/types/inbox-item-action.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const MINUTE_IN_MS = 60 * 1000;

// Dispatches the actions a type declares. The inbox card renders whatever the
// type lists, so a new kind of work needs no new UI.
@Injectable()
export class InboxItemActionService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemTypeEntity)
    private readonly inboxItemTypeRepository: WorkspaceScopedRepository<InboxItemTypeEntity>,
    private readonly inboxItemService: InboxItemService,
  ) {}

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

    switch (action.handler.kind) {
      case 'COMPLETE':
        return this.inboxItemService.complete(ownedItemArgs);
      case 'SNOOZE':
        return this.inboxItemService.snooze({
          ...ownedItemArgs,
          snoozedUntil: new Date(
            Date.now() + action.handler.durationMinutes * MINUTE_IN_MS,
          ),
        });
      case 'OPEN_THREAD':
      case 'OPEN_SUBJECT_RECORD':
        throw new BadRequestException(
          `Action ${actionKey} is resolved by the client`,
        );
      default:
        // Actions are stored as unvalidated jsonb, so an app-declared type can
        // carry a handler kind this server has no dispatcher for. Without this
        // the switch would fall through and resolve undefined.
        throw new BadRequestException(
          `Action ${actionKey} has unsupported handler kind ${
            (action.handler as InboxItemActionHandler).kind
          }`,
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

export const isClientResolvedAction = (action: InboxItemAction): boolean =>
  CLIENT_RESOLVED_ACTION_KINDS.includes(action.handler.kind);
