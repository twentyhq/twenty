import { BadRequestException, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { type InboxItemAction } from 'src/engine/core-modules/inbox/types/inbox-item-action.type';
import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';
import { type InboxItemTransition } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';

// An action is a named shortcut to a transition, so executing one resolves the
// name and hands the transition to the one place that applies them. The engine
// never learns what "approve" means, only which transition it names.
@Injectable()
export class InboxItemActionService {
  constructor(
    private readonly inboxItemService: InboxItemService,
    private readonly inboxTransitionService: InboxTransitionService,
  ) {}

  async execute({
    inboxItemId,
    workspaceId,
    actorUserWorkspaceId,
    actionKey,
    input,
    expectedVersion,
  }: {
    inboxItemId: string;
    workspaceId: string;
    actorUserWorkspaceId: string;
    actionKey: string;
    input?: InboxItemPayload;
    expectedVersion?: number;
  }): Promise<InboxItemEntity> {
    const inboxItem = await this.inboxItemService.findOwnedItemOrThrow({
      inboxItemId,
      workspaceId,
      assigneeUserWorkspaceId: actorUserWorkspaceId,
    });

    const action = this.findActionOrThrow({ inboxItem, actionKey });

    if (isDefined(action.navigation)) {
      throw new BadRequestException(
        `Action ${actionKey} is resolved by the client`,
      );
    }

    if (!isDefined(action.transition)) {
      throw new BadRequestException(
        `Action ${actionKey} declares neither a navigation nor a transition`,
      );
    }

    return this.inboxTransitionService.transition({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      expectedVersion,
      transition: this.applyInput({
        transition: action.transition,
        action,
        input,
      }),
    });
  }

  // Whatever the action collected becomes the transition's result, so a type
  // can declare "request changes needs a feedback field" without the engine
  // knowing that feedback exists.
  private applyInput({
    transition,
    action,
    input,
  }: {
    transition: InboxItemTransition;
    action: InboxItemAction;
    input?: InboxItemPayload;
  }): InboxItemTransition {
    this.assertRequiredInputPresent({ action, input });

    if (transition.kind !== 'RESOLVE') {
      return transition;
    }

    return {
      ...transition,
      result: { ...(transition.result ?? {}), ...(input ?? {}) },
    };
  }

  private assertRequiredInputPresent({
    action,
    input,
  }: {
    action: InboxItemAction;
    input?: InboxItemPayload;
  }): void {
    const missingField = action.inputSchema
      ?.filter((field) => field.isRequired === true)
      .find((field) => {
        const value = input?.[field.key];

        return !isDefined(value) || value === '';
      });

    if (isDefined(missingField)) {
      throw new BadRequestException(
        `Action ${action.key} requires ${missingField.key}`,
      );
    }
  }

  private findActionOrThrow({
    inboxItem,
    actionKey,
  }: {
    inboxItem: InboxItemEntity;
    actionKey: string;
  }): InboxItemAction {
    const action = inboxItem.inboxItemType?.actions?.find(
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
