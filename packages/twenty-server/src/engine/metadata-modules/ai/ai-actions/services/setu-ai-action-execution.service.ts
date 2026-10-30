import { Injectable, Logger } from '@nestjs/common';

import {
  type SetuSendEmailActionPayload,
  type SetuUpdateRecordFieldsActionPayload,
} from 'twenty-shared/ai';
import { EmailOperation, FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';
import { isInsufficientPermissionsError } from 'src/engine/core-modules/tool/tools/email-tool/utils/is-insufficient-permissions-error.util';
import { type SetuAiActionRequestEntity } from 'src/engine/metadata-modules/ai/ai-actions/entities/setu-ai-action-request.entity';
import { SetuAiActionActorService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-actor.service';
import { SetuAiActionLedgerService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-ledger.service';
import { SetuAiActionPreparationService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-preparation.service';
import { type SetuAiActionActor } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-actor.type';
import { type SetuAiActionRunResult } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-run-result.type';
import { isSetuAiActionExecutionPaused } from 'src/engine/metadata-modules/ai/ai-actions/utils/is-setu-ai-action-execution-paused.util';
import { convertPlainTextToEmailHtml } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/convert-plain-text-to-email-html.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SendEmailService } from 'src/modules/messaging/message-outbound-manager/services/send-email.service';

class SetuAiRecordUpdateStop extends Error {
  constructor(readonly result: SetuAiActionRunResult) {
    super(result.errorCode ?? 'blocked');
  }
}

const isSameValue = (left: unknown, right: unknown): boolean =>
  JSON.stringify(left ?? null) === JSON.stringify(right ?? null);

// Runs one approved revision exactly as it was approved. Execution is
// at-least-once from the queue's point of view, so safety comes from the
// ledger: a single claim per row, a started attempt written before any
// external call, and no automatic retry of a send that may have happened.
@Injectable()
export class SetuAiActionExecutionService {
  private readonly logger = new Logger(SetuAiActionExecutionService.name);

  constructor(
    private readonly ledgerService: SetuAiActionLedgerService,
    private readonly actorService: SetuAiActionActorService,
    private readonly preparationService: SetuAiActionPreparationService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly emailComposerService: EmailComposerService,
    private readonly sendEmailService: SendEmailService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async run({
    actionRequestId,
    leaseOwner,
  }: {
    actionRequestId: string;
    leaseOwner: string;
  }): Promise<void> {
    const queued = await this.ledgerService.findById(actionRequestId);

    if (!isDefined(queued) || queued.status !== 'queued') {
      return;
    }

    // The kill switch and the workspace gate leave the row queued rather than
    // failing it, so re-enabling resumes the exact approved work.
    if (
      isSetuAiActionExecutionPaused() ||
      !(await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_SETU_AI_ACTIONS_ENABLED,
        queued.workspaceId,
      ))
    ) {
      return;
    }

    const action = await this.ledgerService.claim({
      actionRequestId,
      leaseOwner,
    });

    if (!isDefined(action)) {
      return;
    }

    if (
      isDefined(action.expiresAt) &&
      action.expiresAt.getTime() <= Date.now()
    ) {
      await this.ledgerService.finishRun({
        action,
        status: 'expired',
        errorCode: 'APPROVAL_EXPIRED',
      });

      return;
    }

    const actor = await this.actorService.resolve({
      workspaceId: action.workspaceId,
      userWorkspaceId: action.initiatorUserWorkspaceId,
    });

    if (!isDefined(actor) || !(await this.isThreadStillOpen(action, actor))) {
      await this.ledgerService.finishRun({
        action,
        status: 'blocked',
        errorCode: 'NOT_AVAILABLE',
      });

      return;
    }

    const attempt = await this.ledgerService.startAttempt(action);
    const result =
      action.kind === 'send_email'
        ? await this.sendEmail(
            action.payload as SetuSendEmailActionPayload,
            actor,
          )
        : await this.updateRecord(action, actor);

    await this.ledgerService.finishAttempt({
      attempt,
      outcome: result.attemptOutcome,
      errorCode: result.errorCode ?? null,
      providerCorrelationId: result.providerCorrelationId ?? null,
      sanitizedResult: result.receipt ?? null,
    });

    const isRecorded = await this.ledgerService.finishRun({
      action,
      status: result.status,
      errorCode: result.errorCode ?? null,
      receipt: result.receipt ?? null,
    });

    if (!isRecorded) {
      this.logger.warn(
        `Action ${action.id} lost its claim before its outcome was recorded`,
      );
    }
  }

  private async isThreadStillOpen(
    action: SetuAiActionRequestEntity,
    actor: SetuAiActionActor,
  ): Promise<boolean> {
    if (!isDefined(action.threadId)) {
      return true;
    }

    try {
      const thread = await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository('agentChatThread', actor.rolePermissionConfig)
            .findOne({ where: { id: action.threadId }, select: { id: true } }),
        actor.authContext,
      );

      return isDefined(thread);
    } catch {
      return false;
    }
  }

  private async sendEmail(
    payload: SetuSendEmailActionPayload,
    actor: SetuAiActionActor,
  ): Promise<SetuAiActionRunResult> {
    const senderAccount = await this.preparationService.findUsableSenderAccount(
      {
        connectedAccountId: payload.connectedAccountId,
        actor,
      },
    );

    if (!isDefined(senderAccount)) {
      return {
        status: 'blocked',
        attemptOutcome: 'blocked',
        errorCode: 'ACCOUNT_UNAVAILABLE',
      };
    }

    // Composition fails before anything leaves the server, so its failures
    // are definite.
    const composed = await this.emailComposerService
      .composeEmail({
        parameters: {
          recipients: {
            to: payload.to.join(','),
            cc: payload.cc.join(','),
            bcc: payload.bcc.join(','),
          },
          subject: payload.subject,
          body: convertPlainTextToEmailHtml(payload.body),
          connectedAccountId: payload.connectedAccountId,
        },
        context: {
          workspaceId: actor.workspaceId,
          userWorkspaceId: actor.userWorkspaceId,
        },
        operation: EmailOperation.SEND,
      })
      .catch(() => ({ success: false as const }));

    if (!composed.success) {
      return {
        status: 'failed',
        attemptOutcome: 'failed',
        errorCode: 'INVALID_INPUT',
      };
    }

    let headerMessageId: string | undefined;

    try {
      const sendResult = await this.sendEmailService.sendComposedEmail(
        composed.data,
      );

      headerMessageId = sendResult.headerMessageId;

      if (composed.data.shouldPersistMessage) {
        await this.sendEmailService
          .persistSentMessage(sendResult, composed.data, actor.workspaceId)
          .catch(() => undefined);
      }
    } catch (error) {
      // A refusal for missing permission is definite; anything else may have
      // reached the provider, so it waits for reconciliation instead of a
      // retry that could send twice.
      if (isInsufficientPermissionsError(error)) {
        return {
          status: 'failed',
          attemptOutcome: 'failed',
          errorCode: 'ACCOUNT_UNAVAILABLE',
        };
      }

      this.logger.warn(
        `Email send outcome unknown: ${error instanceof Error ? error.name : 'error'}`,
      );

      return {
        status: 'delivery_unknown',
        attemptOutcome: 'ambiguous',
      };
    }

    return {
      status: 'succeeded',
      attemptOutcome: 'succeeded',
      providerCorrelationId: headerMessageId,
      receipt: {
        completedAt: new Date().toISOString(),
        summary: `Accepted by the email provider for ${payload.to.join(', ')}. This confirms sending, not delivery or a reply.`,
        ...(isDefined(headerMessageId) && {
          providerMessageId: headerMessageId,
        }),
      },
    };
  }

  // The row is locked, the approved before-values are compared and only the
  // approved fields are written, all in one transaction, so a concurrent
  // human edit produces a conflict instead of being overwritten.
  private async updateRecord(
    action: SetuAiActionRequestEntity,
    actor: SetuAiActionActor,
  ): Promise<SetuAiActionRunResult> {
    const payload = action.payload as SetuUpdateRecordFieldsActionPayload;
    const fieldValuesBefore = action.preconditions.fieldValuesBefore ?? {};

    try {
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const { flatObjectMetadataMaps, objectIdByNameSingular } =
          getWorkspaceContext();
        const objectMetadataId =
          objectIdByNameSingular[payload.objectNameSingular];
        const objectMetadata = isDefined(objectMetadataId)
          ? findFlatEntityByIdInFlatEntityMaps({
              flatEntityMaps: flatObjectMetadataMaps,
              flatEntityId: objectMetadataId,
            })
          : undefined;

        if (!isDefined(objectMetadata)) {
          throw new SetuAiRecordUpdateStop({
            status: 'blocked',
            attemptOutcome: 'blocked',
            errorCode: 'NOT_AVAILABLE',
          });
        }

        const tableName = computeObjectTargetTable(objectMetadata);
        const schemaName = getWorkspaceSchemaName(actor.workspaceId);

        await this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            await transactionScope.executeRawQuery(
              `SELECT "id" FROM "${schemaName}"."${tableName}" WHERE "id" = $1 FOR UPDATE`,
              [payload.recordId],
            );

            const repository = transactionScope.getRepository(
              payload.objectNameSingular,
              actor.rolePermissionConfig,
            );
            const record = await repository.findOne({
              where: { id: payload.recordId },
            });

            if (!isDefined(record)) {
              throw new SetuAiRecordUpdateStop({
                status: 'blocked',
                attemptOutcome: 'blocked',
                errorCode: 'NOT_AVAILABLE',
              });
            }

            const hasChanged = payload.changes.some(
              (change) =>
                !isSameValue(
                  record[change.fieldName],
                  fieldValuesBefore[change.fieldName],
                ),
            );

            if (hasChanged) {
              throw new SetuAiRecordUpdateStop({
                status: 'blocked',
                attemptOutcome: 'blocked',
                errorCode: 'SOURCE_CHANGED',
              });
            }

            await repository.update(
              { id: payload.recordId },
              Object.fromEntries(
                payload.changes.map((change) => [
                  change.fieldName,
                  change.after,
                ]),
              ),
            );
          },
        );
      }, actor.authContext);
    } catch (error) {
      if (error instanceof SetuAiRecordUpdateStop) {
        return error.result;
      }

      // The transaction rolled back, so nothing was written.
      this.logger.warn(
        `Record update failed: ${error instanceof Error ? error.name : 'error'}`,
      );

      return {
        status: 'failed',
        attemptOutcome: 'failed',
        errorCode: 'NOT_AVAILABLE',
      };
    }

    return {
      status: 'succeeded',
      attemptOutcome: 'succeeded',
      receipt: {
        completedAt: new Date().toISOString(),
        summary: `Updated ${payload.changes
          .map((change) => change.fieldLabel)
          .join(', ')} on ${payload.recordLabel}.`,
      },
    };
  }

  // A vanished worker leaves a run behind. A send that may have started is
  // never retried; an unstarted claim goes back to the queue; a record update
  // is judged from the record itself, since its transaction either committed
  // or did not.
  async reconcileAbandonedRun(
    action: SetuAiActionRequestEntity,
  ): Promise<void> {
    const startedAttempt = await this.ledgerService.findStartedAttempt(
      action.id,
    );

    if (!isDefined(startedAttempt)) {
      await this.ledgerService.resolveAbandonedRun({
        action,
        status: 'queued',
      });

      return;
    }

    if (action.kind === 'send_email') {
      await this.ledgerService.finishAttempt({
        attempt: startedAttempt,
        outcome: 'ambiguous',
      });
      await this.ledgerService.resolveAbandonedRun({
        action,
        status: 'delivery_unknown',
      });

      return;
    }

    const status = await this.findRecordUpdateOutcome(action);

    await this.ledgerService.finishAttempt({
      attempt: startedAttempt,
      outcome: status === 'succeeded' ? 'succeeded' : 'ambiguous',
    });
    await this.ledgerService.resolveAbandonedRun({
      action,
      status,
      ...(status === 'blocked' && { errorCode: 'SOURCE_CHANGED' as const }),
    });
  }

  private async findRecordUpdateOutcome(
    action: SetuAiActionRequestEntity,
  ): Promise<'succeeded' | 'queued' | 'blocked' | 'delivery_unknown'> {
    const payload = action.payload as SetuUpdateRecordFieldsActionPayload;
    const actor = await this.actorService.resolve({
      workspaceId: action.workspaceId,
      userWorkspaceId: action.initiatorUserWorkspaceId,
    });

    if (!isDefined(actor)) {
      return 'delivery_unknown';
    }

    const record = await this.workspaceOrmManager
      .executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository(
              payload.objectNameSingular,
              actor.rolePermissionConfig,
            )
            .findOne({ where: { id: payload.recordId } }),
        actor.authContext,
      )
      .catch(() => null);

    if (!isDefined(record)) {
      return 'delivery_unknown';
    }

    if (
      payload.changes.every((change) =>
        isSameValue(record[change.fieldName], change.after),
      )
    ) {
      return 'succeeded';
    }

    const fieldValuesBefore = action.preconditions.fieldValuesBefore ?? {};

    return payload.changes.every((change) =>
      isSameValue(
        record[change.fieldName],
        fieldValuesBefore[change.fieldName],
      ),
    )
      ? 'queued'
      : 'blocked';
  }
}
