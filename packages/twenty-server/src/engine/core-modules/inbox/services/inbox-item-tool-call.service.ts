import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
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
import {
  buildClaimableToolCallPredicate,
  isToolCallHeldByClaim,
  isToolCallRunning,
} from 'src/engine/core-modules/inbox/utils/inbox-tool-call-claim.util';
import { type InboxItemToolCallDraft } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-draft.type';
import { type InboxItemToolCallInput } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-input.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type ToolCallActorArgs = {
  workspaceId: string;
  actorUserWorkspaceId: string;
  accessibleQueueIds: string[];
};

@Injectable()
export class InboxItemToolCallService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
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
    editedInput: InboxItemToolCallInput;
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

  // A failure is left on its row and the item stays in the inbox rather than
  // being cleared, so the person can look at what went wrong.
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

    // No calls is a plan too: doing it is marking the item done.
    const toolCalls = await this.findToolCallsInOrder(workspaceId, inboxItemId);

    const proposedToolCalls = toolCalls.filter(
      (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
    );

    this.assertInputsMatchSchema(proposedToolCalls);

    for (const toolCall of proposedToolCalls) {
      // Claiming the row first is what keeps two runs of the same plan from
      // executing a call twice. Claims go in plan order, so losing one means
      // another run is ahead and owns the rest of the plan.
      const claimedAt = new Date();

      const claim = await this.inboxItemToolCallRepository.update(
        workspaceId,
        { id: toolCall.id, ...buildClaimableToolCallPredicate() },
        {
          resolvedByUserWorkspaceId: actorUserWorkspaceId,
          resolvedAt: claimedAt,
        },
      );

      if ((claim.affected ?? 0) === 0) {
        // A step skipped since the plan was read is the person's call and
        // leaves the rest of the plan theirs to run; anything else that took
        // the row is another run, which owns the rest.
        const currentToolCall = await this.inboxItemToolCallRepository.findOne(
          workspaceId,
          { where: { id: toolCall.id } },
        );

        if (currentToolCall?.status === InboxItemToolCallStatus.REJECTED) {
          continue;
        }

        break;
      }

      await this.executeClaimedToolCall({
        workspaceId,
        actorUserWorkspaceId,
        inboxItemToolCallId: toolCall.id,
        claimedAt,
      });
    }

    return this.settlePlanAfterRun({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
      versionBeforeRun: inboxItem.version,
    });
  }

  // Runs one call and leaves the rest of the plan as it is: sending a reply
  // does not commit the person to the two other steps an agent proposed next
  // to it. The item still clears once nothing in it is left proposed, so a
  // reply that was the only thing to do is one gesture.
  async runOne({
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
    inboxItemToolCallId,
    expectedVersion,
  }: ToolCallActorArgs & {
    inboxItemToolCallId: string;
    expectedVersion?: number;
  }) {
    const { toolCall, inboxItem } =
      await this.findEditableToolCallWithItemOrThrow({
        workspaceId,
        actorUserWorkspaceId,
        accessibleQueueIds,
        inboxItemToolCallId,
      });

    if (isDefined(expectedVersion) && inboxItem.version !== expectedVersion) {
      throw new InboxException(
        `Inbox item ${inboxItem.id} changed since it was read`,
        InboxExceptionCode.INBOX_ITEM_CHANGED,
      );
    }

    // A skipped step is put back in the plan first; running it straight
    // away would read as someone else's change once the claim finds no
    // proposed row.
    if (toolCall.status === InboxItemToolCallStatus.REJECTED) {
      throw new InboxException(
        `Inbox item tool call ${toolCall.id} was skipped`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
      );
    }

    this.assertInputsMatchSchema([toolCall]);

    const claimedAt = new Date();

    // A failed row is not in flight, so it is claimed on its status alone and
    // put back in the proposed state its run expects; the old error goes with
    // it so the row reads as this attempt's.
    const claim =
      toolCall.status === InboxItemToolCallStatus.FAILED
        ? await this.inboxItemToolCallRepository.update(
            workspaceId,
            { id: toolCall.id, status: InboxItemToolCallStatus.FAILED },
            {
              status: InboxItemToolCallStatus.PROPOSED,
              error: null,
              resolvedByUserWorkspaceId: actorUserWorkspaceId,
              resolvedAt: claimedAt,
            },
          )
        : await this.inboxItemToolCallRepository.update(
            workspaceId,
            { id: toolCall.id, ...buildClaimableToolCallPredicate() },
            {
              resolvedByUserWorkspaceId: actorUserWorkspaceId,
              resolvedAt: claimedAt,
            },
          );

    // Unlike a plan run there is nothing to fall back to: the one call asked
    // for is already someone else's.
    if ((claim.affected ?? 0) === 0) {
      throw new InboxException(
        `Inbox item tool call ${toolCall.id} changed since it was read`,
        InboxExceptionCode.INBOX_ITEM_CHANGED,
      );
    }

    await this.executeClaimedToolCall({
      workspaceId,
      actorUserWorkspaceId,
      inboxItemToolCallId: toolCall.id,
      claimedAt,
    });

    return this.settlePlanAfterRun({
      inboxItemId: toolCall.inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
      versionBeforeRun: inboxItem.version,
    });
  }

  // A person can add to a plan what no producer proposed, most often a reply
  // typed by hand on an item that arrived with none. It lands as a row like
  // any other, so what ran is on record whoever wrote it.
  async create({
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
    inboxItemId,
    draft,
  }: ToolCallActorArgs & {
    inboxItemId: string;
    draft: InboxItemToolCallDraft;
  }): Promise<InboxItemToolCallEntity> {
    const inboxItem = await this.inboxItemService.findVisibleItemOrThrow({
      inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
    });

    // The item row is the lock every plan write takes, the same one a fold
    // takes, so two additions read the plan one after the other and cannot
    // land on the same position. The lock re-applies the scope the read
    // used, so an item handed over or moved in between takes no step from
    // whoever held it before.
    return this.coreDataSource.transaction(async (manager) => {
      const lockedItem = await this.inboxItemRepository
        .withManager(manager)
        .findOne(workspaceId, {
          where: this.inboxItemService.buildWriteScope({
            inboxItem,
            actorUserWorkspaceId,
            accessibleQueueIds,
          }),
          lock: { mode: 'pessimistic_write' },
        });

      if (!isDefined(lockedItem)) {
        throw new InboxException(
          `Inbox item ${inboxItemId} changed since it was read`,
          InboxExceptionCode.INBOX_ITEM_CHANGED,
        );
      }

      const toolCallRepository =
        this.inboxItemToolCallRepository.withManager(manager);
      const toolCalls = await toolCallRepository.find(workspaceId, {
        where: { inboxItemId },
        select: { position: true },
      });
      const position = toolCalls.reduce(
        (max, toolCall) => Math.max(max, toolCall.position + 1),
        0,
      );

      return toolCallRepository.insertAndReturnOne(workspaceId, {
        inboxItemId,
        position,
        toolName: draft.toolName,
        label: draft.label,
        description: draft.description ?? null,
        icon: draft.icon ?? null,
        inputSchema: draft.inputSchema ?? [],
        proposedInput: draft.proposedInput,
      });
    });
  }

  // Read back rather than trusting what was loaded before the run: a skip, an
  // earlier failure or another run may have landed while the calls ran.
  private async settlePlanAfterRun({
    inboxItemId,
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
    versionBeforeRun,
  }: ToolCallActorArgs & {
    inboxItemId: string;
    versionBeforeRun: number;
  }) {
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

    // The clear is guarded on the version the run started from: an event
    // folded into the plan while the calls were running must stay visible
    // rather than be swallowed by clearedAt. The calls have run either way, so
    // losing that guard returns the item rather than failing the run.
    try {
      return await this.inboxTransitionService.transition({
        inboxItemId,
        workspaceId,
        actorUserWorkspaceId,
        accessibleQueueIds,
        expectedVersion: versionBeforeRun,
        loadedInboxItem: inboxItemAfterRun,
        transition: { kind: 'CLEAR' },
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

  // The claim time is this run's token: a row that no longer carries it was
  // taken over once the claim went stale, and a late worker must neither run it
  // nor write over whoever took it. Whatever goes wrong in between lands on the
  // row as a failure, so the claim never outlives the run.
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

    if (!isDefined(toolCall) || !isToolCallHeldByClaim(toolCall, claimedAt)) {
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

  // Handed to someone else while the calls ran, the item has moved on rather
  // than gone: the calls did run, and the client reloads on a changed item.
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
  // satisfy the schema the producer declared.
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
  // finished the call in between cannot be undone by a late edit or skip.
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
          ? buildClaimableToolCallPredicate()
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

  private async findEditableToolCallOrThrow(
    args: ToolCallActorArgs & { inboxItemToolCallId: string },
  ): Promise<InboxItemToolCallEntity> {
    const { toolCall } = await this.findEditableToolCallWithItemOrThrow(args);

    return toolCall;
  }

  private async findEditableToolCallWithItemOrThrow({
    workspaceId,
    actorUserWorkspaceId,
    accessibleQueueIds,
    inboxItemToolCallId,
  }: ToolCallActorArgs & {
    inboxItemToolCallId: string;
  }): Promise<{
    toolCall: InboxItemToolCallEntity;
    inboxItem: InboxItemEntity;
  }> {
    const toolCall = await this.inboxItemToolCallRepository.findOne(
      workspaceId,
      { where: { id: inboxItemToolCallId } },
    );

    if (!isDefined(toolCall)) {
      throw new InboxException(
        `Inbox item tool call ${inboxItemToolCallId} not found`,
        InboxExceptionCode.INBOX_ITEM_TOOL_CALL_NOT_FOUND,
      );
    }

    const inboxItem = await this.inboxItemService.findVisibleItemOrThrow({
      inboxItemId: toolCall.inboxItemId,
      workspaceId,
      actorUserWorkspaceId,
      accessibleQueueIds,
    });

    // A failed call stays editable: the person fixes what was wrong and runs
    // it again. Only a call in flight or one that went through is closed.
    if (
      isToolCallRunning(toolCall) ||
      toolCall.status === InboxItemToolCallStatus.EXECUTED
    ) {
      throw new InboxException(
        `Inbox item tool call ${inboxItemToolCallId} is running or has run`,
        InboxExceptionCode.INBOX_ITEM_CHANGED,
      );
    }

    return { toolCall, inboxItem };
  }
}
