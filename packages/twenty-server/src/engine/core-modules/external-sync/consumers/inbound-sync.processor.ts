import { Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

import { InboundEventLedgerService } from '../inbound/inbound-event-ledger.service';
import { TransactionalOutboxService } from '../outbox/transactional-outbox.service';
import {
  validateSyncEnvelope,
  isEchoEvent,
  type SyncEnvelope,
} from '../inbound/validate-sync-envelope.util';
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
  async processInboundEvent(data: {
    recordId: string;
    workspaceId: string;
  }): Promise<void> {
    const { recordId, workspaceId } = data;

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
      const envelope = this.parseEnvelope(record);
      if (!envelope) {
        await this.inboundLedger.markDead(recordId, 'Failed to parse envelope');
        this.logger.error(
          `Inbound event ${record.eventId}: envelope parse failed`,
        );
        return;
      }
      const validation = validateSyncEnvelope(envelope);

      if (!validation.valid) {
        await this.inboundLedger.markDead(
          recordId,
          validation.errors.join('; '),
        );
        this.logger.error(
          `Inbound event ${record.eventId} failed validation: ${validation.errors.join('; ')}`,
        );
        return;
      }

      // 4. Echo prevention — skip events from Twenty
      if (isEchoEvent(envelope)) {
        await this.inboundLedger.markProcessed(recordId);
        this.logger.log(
          `Skipping echo event ${record.eventId} (sourceSystem=TWENTY)`,
        );
        return;
      }

      // 5. Field-ownership guard — filter to authoritative fields only
      const authoritativeFields = filterAuthoritativeFields(
        envelope.sourceCollection,
        envelope.payload,
      );

      // 6. PR2: stub record write — PR4 will write to actual domain objects
      //    For now, we just append to the outbox to prove the pipeline
      await this.outboxService.append({
        eventId: record.eventId,
        idempotencyKey: `${workspaceId}::inbound::${record.eventId}`,
        sourceSystem: record.sourceSystem,
        eventType: envelope.sourceCollection,
        payload: authoritativeFields,
      });

      // 7. Mark as PROCESSED
      await this.inboundLedger.markProcessed(recordId);

      this.logger.log(`Successfully processed inbound event ${record.eventId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await this.inboundLedger.markDead(recordId, errorMessage);

      this.logger.error(
        `Failed to process inbound event ${record.eventId}: ${errorMessage}`,
      );
    }
  }

  private parseEnvelope(record: {
    eventId: string;
    rawEnvelope?: unknown;
  }): SyncEnvelope | undefined {
    try {
      const raw =
        typeof record.rawEnvelope === 'string'
          ? JSON.parse(record.rawEnvelope)
          : record.rawEnvelope;
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        return raw as SyncEnvelope;
      }
    } catch {
      // fall through to undefined
    }
    return undefined;
  }
}
