import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, LessThan, Or } from 'typeorm';
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
import { findInvalidInputKeys } from 'src/engine/core-modules/inbox/utils/find-invalid-input-keys.util';
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

// A claim older than this belongs to a run that died between claiming and
// finishing; the next run may take the call over rather than wait forever
export const TOOL_CALL_CLAIM_TIMEOUT_MS = 10 * 60 * 1000;

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

    const patch = {
      status: isRejected
        ? InboxItemToolCallStatus.REJECTED
        : InboxItemToolCallStatus.PROPOSED,
      resolvedByUserWorkspaceId: isRejected ? actorUserWorkspaceId : null,
      resolvedAt: isRejected ? new Date() : null,
    };

    await this.updateUnlessChanged(workspaceId, toolCall, patch);

    return { ...toolCall, ...patch };
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

    const toolCalls = await this.findToolCallsInOrder(workspaceId, inboxItemId);

    if (toolCalls.length === 0) {
      throw new InboxException(
        `Inbox item ${inboxItemId} has no tool calls to run`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
      );
    }

    const proposedToolCalls = toolCalls.filter(
      (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
    );

    this.assertInputsMatchSchema(proposedToolCalls);

    for (const toolCall of proposedToolCalls) {
      // Claiming the row first is what keeps two runs of the same plan from
      // executing a call twice. Claims go in plan order, so losing one means
      // another run is ahead: it owns the rest of the plan and this one stops
      // rather than running a later call while an earlier one is in progress
      const claimedAt = new Date();

      const claim = await this.inboxItemToolCallRepository.update(
        workspaceId,
        { id: toolCall.id, ...buildClaimablePredicate() },
        {
          resolvedByUserWorkspaceId: actorUserWorkspaceId,
          resolvedAt: claimedAt,
        },
      );

      if ((claim.affected ?? 0) === 0) {
        break;
      }

      await this.executeClaimedToolCall({
        workspaceId,
        actorUserWorkspaceId,
        inboxItemToolCallId: toolCall.id,
        claimedAt,
      });
    }

    // Read back rather than trusting what was loaded before the loop: a skip,
    // an earlier failure or another run may have landed while the calls were
    // executing
    const actorArgs = {
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
    };

    const [toolCallsAfterRun, inboxItemAfterRun] = await Promise.all([
      this.findToolCallsInOrder(workspaceId, inboxItemId),
      this.findItemAfterRunOrThrow(actorArgs),
    ]);

    const hasFailure = toolCallsAfterRun.some(
      (toolCall) => toolCall.status === InboxItemToolCallStatus.FAILED,
    );
    const hasCallStillProposed = toolCallsAfterRun.some(
      (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
    );

    if (hasFailure || hasCallStillProposed) {
      return inboxItemAfterRun;
    }

    const wasAnyRejected = toolCallsAfterRun.some(
      (toolCall) => toolCall.status === InboxItemToolCallStatus.REJECTED,
    );

    // The clear is guarded on the version the run started from: an event
    // folded into the plan while the calls were running must stay visible
    // rather than be swallowed by clearedAt. The calls have run either way,
    // so losing that guard returns the item with its checks instead of
    // failing the run; the person closes the plan again once they have seen
    // what arrived
    try {
      return await this.inboxTransitionService.transition({
        inboxItemId,
        workspaceId,
        actorUserWorkspaceId,
        accessibleQueueIds,
        expectedVersion: inboxItem.version,
        loadedInboxItem: inboxItemAfterRun,
        transition: {
          kind: 'CLEAR',
          outcome: wasAnyRejected
            ? AGENT_PLAN_OUTCOME.partial
            : AGENT_PLAN_OUTCOME.done,
        },
      });
    } catch (error) {
      if (
        error instanceof InboxException &&
        error.code === InboxExceptionCode.INBOX_ITEM_CHANGED
      ) {
        return this.findItemAfterRunOrThrow(actorArgs);
      }

      throw error;
    }
  }

  // Runs on the row as it is after the claim, not as it was loaded before the
  // loop, so an edit that landed in between is what executes. The claim time
  // is this run's token: a row that no longer carries it was taken over once
  // the claim went stale, and a late worker must neither run it nor write
  // over whoever took it. Whatever goes wrong in between lands on the row as
  // a failure, so the claim never outlives the run.
  private async executeClaimedToolCall({
    workspaceId,
    actorUserWorkspaceId,
    inboxItemToolCallId,
    claimedAt,
  }: {
    workspaceId: string;
    actorUserWorkspaceId: string;
    inboxItemToolCallId: string;
    claimedAt: Date;
  }): Promise<void> {
    const toolCall = await this.inboxItemToolCallRepository.findOne(
      workspaceId,
      { where: { id: inboxItemToolCallId } },
    );

    if (!isDefined(toolCall) || !isHeldByClaim(toolCall, claimedAt)) {
      return;
    }

    const invalidKeys = findInvalidInputKeys(toolCall);

    const result =
      invalidKeys.length > 0
        ? {
            status: 'FAILED' as const,
            error: `Invalid input for ${invalidKeys.join(', ')}`,
          }
        : await this.inboxToolCallExecutionService
            .execute({
              workspaceId,
              actorUserWorkspaceId,
              toolName: toolCall.toolName,
              input: toolCall.editedInput ?? toolCall.proposedInput,
            })
            .catch((error: unknown) => ({
              status: 'FAILED' as const,
              error: error instanceof Error ? error.message : String(error),
            }));

    await this.inboxItemToolCallRepository.update(
      workspaceId,
      {
        id: toolCall.id,
        status: InboxItemToolCallStatus.PROPOSED,
        resolvedAt: claimedAt,
      },
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

  // Read once the calls have run. Handed to someone else in the meantime, the
  // item has moved on rather than gone: the calls did run, and the client
  // already knows to reload on a changed item
  private async findItemAfterRunOrThrow(
    args: ToolCallActorArgs & { inboxItemId: string },
  ) {
    try {
      return await this.inboxItemService.findVisibleItemOrThrow(args);
    } catch (error) {
      if (
        error instanceof InboxException &&
        error.code === InboxExceptionCode.INBOX_ITEM_NOT_FOUND
      ) {
        throw new InboxException(
          `Inbox item ${args.inboxItemId} left the actor's view while its calls ran`,
          InboxExceptionCode.INBOX_ITEM_CHANGED,
        );
      }

      throw error;
    }
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

  // The editor lets a person clear or retype any field; what runs must still
  // satisfy the schema the producer declared
  private assertInputsMatchSchema(toolCalls: InboxItemToolCallEntity[]) {
    for (const toolCall of toolCalls) {
      const invalidKeys = findInvalidInputKeys(toolCall);

      if (invalidKeys.length > 0) {
        throw new InboxException(
          `Inbox item tool call ${toolCall.id} has invalid input for ${invalidKeys.join(', ')}`,
          InboxExceptionCode.INVALID_INBOX_TOOL_CALL_INPUT,
        );
      }
    }
  }

  // Compare-and-set on the state read a moment ago, so a run that claimed or
  // finished the call in between cannot be undone by a late edit or skip
  private async updateUnlessChanged(
    workspaceId: string,
    toolCall: InboxItemToolCallEntity,
    patch: QueryDeepPartialEntity<InboxItemToolCallEntity>,
  ): Promise<void> {
    const result = await this.inboxItemToolCallRepository.update(
      workspaceId,
      {
        id: toolCall.id,
        ...(toolCall.status === InboxItemToolCallStatus.PROPOSED
          ? buildClaimablePredicate()
          : { status: toolCall.status }),
      },
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
  // while it is neither running nor run.
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
      isToolCallRunning(toolCall) ||
      toolCall.status === InboxItemToolCallStatus.EXECUTED ||
      toolCall.status === InboxItemToolCallStatus.FAILED
    ) {
      throw new InboxException(
        `Inbox item tool call ${inboxItemToolCallId} is running or has run`,
        InboxExceptionCode.INBOX_ITEM_CHANGED,
      );
    }

    return toolCall;
  }
}

const getClaimCutoff = () => new Date(Date.now() - TOOL_CALL_CLAIM_TIMEOUT_MS);

// A proposed call nobody holds, or one whose holder has been gone long enough
// to count as dead
const buildClaimablePredicate = () => ({
  status: InboxItemToolCallStatus.PROPOSED,
  resolvedAt: Or(IsNull(), LessThan(getClaimCutoff())),
});

const isHeldByClaim = (toolCall: InboxItemToolCallEntity, claimedAt: Date) =>
  toolCall.status === InboxItemToolCallStatus.PROPOSED &&
  isDefined(toolCall.resolvedAt) &&
  toolCall.resolvedAt.getTime() === claimedAt.getTime();

const isToolCallRunning = (toolCall: InboxItemToolCallEntity) =>
  toolCall.status === InboxItemToolCallStatus.PROPOSED &&
  isDefined(toolCall.resolvedAt) &&
  toolCall.resolvedAt > getClaimCutoff();
