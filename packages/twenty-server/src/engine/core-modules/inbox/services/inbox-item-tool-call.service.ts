import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { InboxItemToolCallStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-tool-call-status.enum';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxToolCallExecutionService } from 'src/engine/core-modules/inbox/services/inbox-tool-call-execution.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type ToolCallActorArgs = {
  workspaceId: string;
  actorUserWorkspaceId: string;
  accessibleQueueIds: string[];
};

export const AGENT_PLAN_OUTCOME = {
  done: 'DONE',
  partial: 'PARTIAL',
  dismissed: 'DISMISSED',
} as const;

// The rows under a plan. Editing and rejecting are the person shaping the plan;
// running it is one act over every row still standing, and it is what ends the
// item.
@Injectable()
export class InboxItemToolCallService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemToolCallEntity)
    private readonly inboxItemToolCallRepository: WorkspaceScopedRepository<InboxItemToolCallEntity>,
    private readonly inboxItemService: InboxItemService,
    private readonly inboxTransitionService: InboxTransitionService,
    private readonly inboxToolCallExecutionService: InboxToolCallExecutionService,
  ) {}

  async updateInput({
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
    inboxItemToolCallId,
    editedInput,
  }: ToolCallActorArgs & {
    inboxItemToolCallId: string;
    editedInput: InboxItemPayload;
  }): Promise<InboxItemToolCallEntity> {
    const toolCall = await this.findEditableToolCallOrThrow({
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
      inboxItemToolCallId,
    });

    await this.updateUnlessChanged(workspaceId, toolCall, { editedInput });

    return { ...toolCall, editedInput };
  }

  async setRejected({
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
    inboxItemToolCallId,
    isRejected,
  }: ToolCallActorArgs & {
    inboxItemToolCallId: string;
    isRejected: boolean;
  }): Promise<InboxItemToolCallEntity> {
    const toolCall = await this.findEditableToolCallOrThrow({
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
      inboxItemToolCallId,
    });

    const status = isRejected
      ? InboxItemToolCallStatus.REJECTED
      : InboxItemToolCallStatus.PROPOSED;

    await this.updateUnlessChanged(workspaceId, toolCall, {
      status,
      resolvedByUserWorkspaceId: isRejected ? actorUserWorkspaceId : null,
      resolvedAt: isRejected ? new Date() : null,
    });

    return { ...toolCall, status };
  }

  // Runs every call still proposed, in order, then clears the item with an
  // outcome that says whether the whole plan went through. A failure is left
  // on its row and the item stays in the inbox for the person to look at.
  async runAll({
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
    inboxItemId,
    expectedVersion,
  }: ToolCallActorArgs & {
    inboxItemId: string;
    expectedVersion?: number;
  }) {
    const inboxItem = await this.inboxItemService.findVisibleItemOrThrow({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
    });

    if (isDefined(expectedVersion) && inboxItem.version !== expectedVersion) {
      throw new InboxException(
        `Inbox item ${inboxItemId} changed since it was read`,
        InboxExceptionCode.INBOX_ITEM_CHANGED,
      );
    }

    const proposedToolCalls = (
      await this.findToolCallsInOrder(workspaceId, inboxItemId)
    ).filter(
      (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
    );

    this.assertRequiredInputsPresent(proposedToolCalls);

    for (const toolCall of proposedToolCalls) {
      // Claiming the row first is what keeps two runs of the same plan from
      // executing a call twice: only the run whose claim lands executes it
      const claim = await this.inboxItemToolCallRepository.update(
        workspaceId,
        {
          id: toolCall.id,
          status: InboxItemToolCallStatus.PROPOSED,
          resolvedAt: IsNull(),
        },
        {
          resolvedByUserWorkspaceId: actorUserWorkspaceId,
          resolvedAt: new Date(),
        },
      );

      if ((claim.affected ?? 0) === 0) {
        continue;
      }

      const result = await this.inboxToolCallExecutionService.execute({
        workspaceId,
        actorUserWorkspaceId,
        toolName: toolCall.toolName,
        input: toolCall.editedInput ?? toolCall.proposedInput,
      });

      await this.inboxItemToolCallRepository.update(
        workspaceId,
        { id: toolCall.id },
        {
          status:
            result.status === 'EXECUTED'
              ? InboxItemToolCallStatus.EXECUTED
              : InboxItemToolCallStatus.FAILED,
          output: result.status === 'EXECUTED' ? result.output : null,
          error: result.status === 'FAILED' ? result.error : null,
        },
      );
    }

    // Read back rather than trusting the rows from before the loop: a skip,
    // an earlier failure or another run may have landed in the meantime
    const toolCallsAfterRun = await this.findToolCallsInOrder(
      workspaceId,
      inboxItemId,
    );

    const hasFailure = toolCallsAfterRun.some(
      (toolCall) => toolCall.status === InboxItemToolCallStatus.FAILED,
    );
    const hasCallStillProposed = toolCallsAfterRun.some(
      (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
    );

    if (hasFailure || hasCallStillProposed) {
      return this.inboxItemService.findVisibleItemOrThrow({
        inboxItemId,
        workspaceId,
        actorUserWorkspaceId,
        accessibleQueueIds,
      });
    }

    const wasAnyRejected = toolCallsAfterRun.some(
      (toolCall) => toolCall.status === InboxItemToolCallStatus.REJECTED,
    );

    return this.inboxTransitionService.transition({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
      expectedVersion,
      loadedInboxItem: inboxItem,
      transition: {
        kind: 'CLEAR',
        outcome: wasAnyRejected
          ? AGENT_PLAN_OUTCOME.partial
          : AGENT_PLAN_OUTCOME.done,
      },
    });
  }

  private findToolCallsInOrder(
    workspaceId: string,
    inboxItemId: string,
  ): Promise<InboxItemToolCallEntity[]> {
    return this.inboxItemToolCallRepository.find(workspaceId, {
      where: { inboxItemId },
      order: { position: 'ASC' },
    });
  }

  // The editor lets a person clear any field; what runs must still satisfy
  // the schema the producer declared
  private assertRequiredInputsPresent(toolCalls: InboxItemToolCallEntity[]) {
    for (const toolCall of toolCalls) {
      const input = (toolCall.editedInput ??
        toolCall.proposedInput ??
        {}) as Record<string, unknown>;

      const missingKeys = toolCall.inputSchema
        .filter((field) => field.isRequired === true)
        .map((field) => field.key)
        .filter((key) => !isDefined(input[key]) || input[key] === '');

      if (missingKeys.length > 0) {
        throw new InboxException(
          `Inbox item tool call ${toolCall.id} is missing ${missingKeys.join(', ')}`,
          InboxExceptionCode.INVALID_INBOX_TOOL_CALL_INPUT,
        );
      }
    }
  }

  // Compare-and-set on the status read a moment ago, so a run that finished
  // in between cannot be undone by a late edit or skip
  private async updateUnlessChanged(
    workspaceId: string,
    toolCall: InboxItemToolCallEntity,
    patch: QueryDeepPartialEntity<InboxItemToolCallEntity>,
  ): Promise<void> {
    const result = await this.inboxItemToolCallRepository.update(
      workspaceId,
      { id: toolCall.id, status: toolCall.status },
      patch,
    );

    if ((result.affected ?? 0) === 0) {
      throw new InboxException(
        `Inbox item tool call ${toolCall.id} changed since it was read`,
        InboxExceptionCode.INBOX_ITEM_CHANGED,
      );
    }
  }

  // A call can only be shaped through an item the actor can see, and only
  // while it has not run.
  private async findEditableToolCallOrThrow({
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
    inboxItemToolCallId,
  }: ToolCallActorArgs & {
    inboxItemToolCallId: string;
  }): Promise<InboxItemToolCallEntity> {
    const toolCall = await this.inboxItemToolCallRepository.findOne(
      workspaceId,
      { where: { id: inboxItemToolCallId } },
    );

    if (!isDefined(toolCall)) {
      throw new InboxException(
        `Inbox item tool call ${inboxItemToolCallId} not found`,
        InboxExceptionCode.INBOX_ITEM_NOT_FOUND,
      );
    }

    await this.inboxItemService.findVisibleItemOrThrow({
      inboxItemId: toolCall.inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
    });

    if (
      toolCall.status === InboxItemToolCallStatus.EXECUTED ||
      toolCall.status === InboxItemToolCallStatus.FAILED
    ) {
      throw new InboxException(
        `Inbox item tool call ${inboxItemToolCallId} has already run`,
        InboxExceptionCode.INBOX_ITEM_CHANGED,
      );
    }

    return toolCall;
  }
}
