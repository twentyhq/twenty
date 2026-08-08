import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { type InboxItemAction } from 'src/engine/core-modules/inbox/types/inbox-item-action.type';
import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';
import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-resolution.type';
import { type InboxItemTransition } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';

const coerceField = (
  field: InboxItemFieldSchema,
  value: InboxItemPayload[string] | undefined,
): InboxItemPayload[string] | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  if (field.type === 'NUMBER') {
    // Number('') is 0 and Number(' ') is 0, so an empty field would silently
    // resolve as zero rather than being reported as missing
    const parsed =
      typeof value === 'string' && value.trim() === ''
        ? Number.NaN
        : Number(value);

    if (!Number.isFinite(parsed)) {
      throw new InboxException(
        `${field.key} must be a number`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
      );
    }

    return parsed;
  }

  if (field.type === 'BOOLEAN') {
    if (typeof value === 'boolean') {
      return value;
    }

    if (value !== 'true' && value !== 'false') {
      throw new InboxException(
        `${field.key} must be a boolean`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
      );
    }

    return value === 'true';
  }

  return String(value);
};

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
    memberQueueIds,
    actionKey,
    input,
    expectedVersion,
  }: {
    inboxItemId: string;
    workspaceId: string;
    actorUserWorkspaceId: string;
    memberQueueIds: string[];
    actionKey: string;
    input?: InboxItemPayload;
    expectedVersion?: number;
  }): Promise<InboxItemEntity> {
    const inboxItem = await this.inboxItemService.findVisibleItemOrThrow({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      memberQueueIds,
    });

    const action = this.findActionOrThrow({ inboxItem, actionKey });

    if (isDefined(action.navigation)) {
      throw new InboxException(
        `Action ${actionKey} is resolved by the client`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
      );
    }

    if (!isDefined(action.transition)) {
      throw new InboxException(
        `Action ${actionKey} declares neither a navigation nor a transition`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
      );
    }

    return this.inboxTransitionService.transition({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      memberQueueIds,
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

    const declaredInput = this.readDeclaredInput({ action, input });

    if (
      transition.kind !== 'CLEAR' ||
      Object.keys(declaredInput).length === 0
    ) {
      return transition;
    }

    return {
      ...transition,
      result: { ...(transition.result ?? {}), ...declaredInput },
    };
  }

  // Only what the action declared gets through, coerced to the type it said it
  // was, so a declared NUMBER cannot land in the result as the string "12"
  private readDeclaredInput({
    action,
    input,
  }: {
    action: InboxItemAction;
    input?: InboxItemPayload;
  }): InboxItemPayload {
    return Object.fromEntries(
      (action.inputSchema ?? [])
        .map((field) => [field.key, coerceField(field, input?.[field.key])])
        .filter(([, value]) => isDefined(value)),
    );
  }

  private assertRequiredInputPresent({
    action,
    input,
  }: {
    action: InboxItemAction;
    input?: InboxItemPayload;
  }): void {
    const missingField = action.inputSchema
      ?.filter((field) => field.isRequired)
      .find((field) => {
        const value = input?.[field.key];

        return !isDefined(value) || value === '';
      });

    if (isDefined(missingField)) {
      throw new InboxException(
        `Action ${action.key} requires ${missingField.key}`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
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
      throw new InboxException(
        `Unknown action ${actionKey} for this inbox item`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
      );
    }

    return action;
  }
}
