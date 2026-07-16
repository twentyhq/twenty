import { Process, Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

import { InboundEventLedgerService } from '../inbound/inbound-event-ledger.service';
import { TransactionalOutboxService } from '../outbox/transactional-outbox.service';
import { validateSyncEnvelope, isEchoEvent } from '../inbound/validate-sync-envelope.util';
import { filterAuthoritativeFields } from './field-ownership-guard.util';

/**
 * Inbound sync processor.
 * @Process: ledger → dedup/schema/echo → field-ownership guard → record write + outbox append.
 *
 * PR2: tests against stub/mock targets (PR4 objects don't exist yet).
 */
@Processor(MessageQueue.externalSyncQueue)
export class InboundSyncProcessor {
  private readonly logger = new Logger(InboundSyncProcessor.name);

  constructor(
    private readonly inboundLedger: InboundEventLedgerService,
    private readonly outboxService: TransactionalOutboxService,
  ) {}

  @Process('process-inbound-event')
  async processInboundEvent(
    job: Job<{ recordId: string; workspaceId: string }>,
  ): Promise<void> {
    const { recordId, workspaceId } = job.data;

    this.logger.log(
      `Processing inbound event record ${recordId} (workspace ${workspaceId})`,
    );

    // 1. Get the ledger record
    const record = await this.inboundLedger.getRecord(recordId);
    if (!record) {
      this.logger.warn(`Inbound event record ${recordId} not found`);
      return;
    }

    // 2. Mark as PROCESSING
    await this.inboundLedger.markProcessing(recordId);

    try {
      // 3. Validate the envelope
      const rawEnvelope = this.parseEnvelope(record);
      const validation = validateSyncEnvelope(rawEnvelope);

      if (!validation.valid) {
        await this.inboundLedger.markDead(recordId, validation.errors.join('; '));
        this.logger.error(
          `Inbound event ${record.eventId} failed validation: ${validation.errors.join('; ')}`,
        );
        return;
      }

      // 4. Echo prevention — skip events from Twenty
      if (isEchoEvent(rawEnvelope as any)) {
        await this.inboundLedger.markProcessed(recordId);
        this.logger.log(
          `Skipping echo event ${record.eventId} (sourceSystem=TWENTY)`,
        );
        return;
      }

      // 5. Field-ownership guard — filter to authoritative fields only
      const authoritativeFields = filterAuthoritativeFields(
        rawEnvelope.sourceCollection,
        rawEnvelope.payload as Record<string, unknown>,
      );

      // 6. PR2: stub record write — PR4 will write to actual domain objects
      //    For now, we just append to the outbox to prove the pipeline
      await this.outboxService.append({
        eventId: record.eventId,
        idempotencyKey: `${workspaceId}::inbound::${record.eventId}`,
        sourceSystem: record.sourceSystem,
        eventType: record.sourceCollection,
        payload: authoritativeFields,
      });

      // 7. Mark as PROCESSED
      await this.inboundLedger.markProcessed(recordId);

      this.logger.log(
        `Successfully processed inbound event ${record.eventId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await this.inboundLedger.markDead(recordId, errorMessage);

      this.logger.error(
        `Failed to process inbound event ${record.eventId}: ${errorMessage}`,
      );
    }
  }

  private parseEnvelope(record: any): unknown {
    // In PR2, the envelope is just the rawEnvelope from the record
    // In PR3+, it's parsed from the stored JSON
    try {
      return typeof record.rawEnvelope === 'string'
        ? JSON.parse(record.rawEnvelope)
        : record.rawEnvelope;
    } catch {
      return { eventId: record.eventId };
    }
  }
}
