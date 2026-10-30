import { Injectable } from '@nestjs/common';

import {
  type SetuSendEmailActionPayload,
  type SetuUpdateRecordFieldsActionPayload,
} from 'twenty-shared/ai';
import { isPlainObject } from 'twenty-shared/utils';

import { type SetuAiActionRequestEntity } from 'src/engine/metadata-modules/ai/ai-actions/entities/setu-ai-action-request.entity';
import { SetuAiActionDispatcherService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-dispatcher.service';
import {
  SetuAiActionLedgerService,
  type SetuAiActionProjectionResult,
} from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-ledger.service';
import { SetuAiActionPreparationService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-preparation.service';
import { SetuAiActionException } from 'src/engine/metadata-modules/ai/ai-actions/setu-ai-action.exception';
import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import { type SetuAiActionProposalInput } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-proposal-input.type';

// Entry point for the proposal tool, the tool policy and the review API.
// Approval queues work only after the decision commits.
@Injectable()
export class SetuAiActionService {
  constructor(
    private readonly preparationService: SetuAiActionPreparationService,
    private readonly ledgerService: SetuAiActionLedgerService,
    private readonly dispatcherService: SetuAiActionDispatcherService,
  ) {}

  async propose({
    input,
    actor,
    threadId,
    deduplicationKey,
  }: {
    input: SetuAiActionProposalInput;
    actor: SetuAiActionActor;
    threadId: string | null;
    deduplicationKey: string;
  }): Promise<SetuAiActionRequestEntity> {
    const prepared = await this.preparationService.prepare(input, actor);

    return this.ledgerService.createProposal({
      owner: actor,
      threadId,
      deduplicationKey,
      prepared,
    });
  }

  // An edit is prepared like a fresh proposal from the previous revision's
  // target, so the sender and record stay fixed while the content changes.
  async revise({
    actor,
    actionRequestId,
    expectedStateVersion,
    edits,
  }: {
    actor: SetuAiActionActor;
    actionRequestId: string;
    expectedStateVersion: number;
    edits: Record<string, unknown>;
  }): Promise<SetuAiActionRequestEntity> {
    const previous = await this.ledgerService.findOwnedAction(
      actor,
      actionRequestId,
    );

    if (!isPlainObject(edits)) {
      throw new SetuAiActionException(
        'Edits must be an object',
        'INVALID_INPUT',
      );
    }

    const input: SetuAiActionProposalInput =
      previous.kind === 'send_email'
        ? {
            kind: 'send_email',
            sendEmail: {
              ...(previous.payload as SetuSendEmailActionPayload),
              ...(edits as Partial<SetuSendEmailActionPayload>),
              connectedAccountId: (
                previous.payload as SetuSendEmailActionPayload
              ).connectedAccountId,
            },
          }
        : {
            kind: 'update_record_fields',
            updateRecordFields: {
              objectNameSingular: (
                previous.payload as SetuUpdateRecordFieldsActionPayload
              ).objectNameSingular,
              recordId: (
                previous.payload as SetuUpdateRecordFieldsActionPayload
              ).recordId,
              fields: isPlainObject(edits.fields) ? edits.fields : {},
            },
          };

    const prepared = await this.preparationService.prepare(input, actor);

    return this.ledgerService.createRevision({
      owner: actor,
      actionRequestId,
      expectedStateVersion,
      deduplicationKey: `revision:${actionRequestId}:${expectedStateVersion}`,
      prepared,
    });
  }

  async decide(args: {
    actor: SetuAiActionActor;
    actionRequestId: string;
    expectedStateVersion: number;
    decision: 'approve' | 'reject';
    clientRequestId: string;
  }): Promise<SetuAiActionRequestEntity> {
    const action = await this.ledgerService.decide({
      ...args,
      owner: args.actor,
    });

    if (action.status === 'queued') {
      await this.dispatcherService.enqueue(action.id);
    }

    return action;
  }

  async cancel(args: {
    actor: SetuAiActionActor;
    actionRequestId: string;
    expectedStateVersion: number;
    clientRequestId: string;
  }): Promise<SetuAiActionRequestEntity> {
    return this.ledgerService.cancel({ ...args, owner: args.actor });
  }

  async findProjections(args: {
    actor: Pick<SetuAiActionActor, 'workspaceId' | 'userWorkspaceId'>;
    actionRequestIds: string[];
  }): Promise<SetuAiActionProjectionResult[]> {
    return this.ledgerService.findProjections({
      owner: args.actor,
      actionRequestIds: args.actionRequestIds,
    });
  }
}
