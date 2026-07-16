import { Process, Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

import { OutboundEventLedgerService } from '../outbound/outbound-event-ledger.service';
import { TransactionalOutboxService } from '../outbox/transactional-outbox.service';

/**
 * Outbound sync processor.
 * @Process: outbox → outbound ledger → relay to PR3 signer.
 *
 * PR2: stub implementation — marks entries through the outbound ledger.
 * PR3+: calls sign-directus-projection and sends to Directus.
 */
@Processor(MessageQueue.externalSyncQueue)
export class OutboundSyncProcessor {
  private readonly logger = new Logger(OutboundSyncProcessor.name);

  constructor(
    private readonly outboundLedger: OutboundEventLedgerService,
    private readonly outboxService: TransactionalOutboxService,
  ) {}

  @Process('process-outbound-event')
  async processOutboundEvent(
    job: Job<{ outboxEntryId: string; workspaceId: string }>,
  ): Promise<void> {
    const { outboxEntryId, workspaceId } = job.data;

    this.logger.log(
      `Processing outbound event from outbox ${outboxEntryId} (workspace ${workspaceId})`,
    );

    // 1. Get the outbox entry
    const outboxEntry = await this.outboxService.getEntry(outboxEntryId);
    if (!outboxEntry) {
      this.logger.warn(`Outbox entry ${outboxEntryId} not found`);
      return;
    }

    if (outboxEntry.status !== 'PENDING') {
      this.logger.debug(
        `Outbox entry ${outboxEntryId} already ${outboxEntry.status}, skipping`,
      );
      return;
    }

    try {
      // 2. Record in the outbound ledger
      const ledgerRecord = await this.outboundLedger.record({
        eventId: outboxEntry.eventId,
        idempotencyKey: outboxEntry.idempotencyKey,
        targetCollection: outboxEntry.eventType,
        payload: outboxEntry.payload,
        beforeHash: undefined, // PR2 stub — computed in PR4
        afterHash: undefined,  // PR2 stub — computed in PR4
      });

      // 3. Mark as SIGNED
      await this.outboundLedger.markSigned(ledgerRecord.id);

      // 4. PR2: mark as SENT (no real signer yet)
      // PR3+: call sign-directus-projection.util.ts then send to Directus
      await this.outboundLedger.markSent(ledgerRecord.id);

      // 5. Mark the outbox entry as SENT
      await this.outboxService.markSent(outboxEntryId);

      this.logger.log(
        `Successfully processed outbound event ${outboxEntry.eventId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await this.outboxService.markDead(outboxEntryId, errorMessage);

      this.logger.error(
        `Failed to process outbound event ${outboxEntry.eventId}: ${errorMessage}`,
      );
    }
  }
}
