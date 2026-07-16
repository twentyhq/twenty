import { Process, Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

import { TransactionalOutboxService } from './transactional-outbox.service';

/**
 * Outbox relay processor.
 * Polls PENDING outbox entries, publishes to the outbound ledger,
 * and marks SENT. Bounded exponential backoff on failure.
 * On exhaustion → dead-letter.
 */
@Processor(MessageQueue.externalSyncQueue)
export class OutboxRelayProcessor {
  private readonly logger = new Logger(OutboxRelayProcessor.name);
  private readonly maxAttempts = 5;

  constructor(private readonly outboxService: TransactionalOutboxService) {}

  @Process('process-outbox')
  async processOutbox(job: Job<{ entryId: string }>): Promise<void> {
    const { entryId } = job.data;

    const entry = await this.outboxService.getEntry(entryId);
    if (!entry) {
      this.logger.warn(`Outbox entry ${entryId} not found`);
      return;
    }

    if (entry.status !== 'PENDING') {
      this.logger.debug(`Outbox entry ${entryId} already ${entry.status}`);
      return;
    }

    try {
      // PR2: simulate processing — mark as sent
      // PR3+: this will call the outbound ledger and signer
      this.logger.log(`Processing outbox entry ${entryId}`);

      // Mark as sent after successful processing
      await this.outboxService.markSent(entryId);

      this.logger.log(`Outbox entry ${entryId} marked as SENT`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      await this.outboxService.incrementAttempt(entryId);

      if (entry.attemptCount >= this.maxAttempts) {
        // Exhaustion → send to dead letter
        await this.outboxService.markDead(entryId, errorMessage);
        this.logger.error(
          `Outbox entry ${entryId} exhausted after ${this.maxAttempts} attempts, moving to DLQ`,
        );
      } else {
        const attempt = entry.attemptCount;
        this.logger.warn(
          `Outbox entry ${entryId} failed (attempt ${attempt}/${this.maxAttempts}): ${errorMessage}`,
        );
        // Re-throw to trigger BullMQ retry
        throw error;
      }
    }
  }
}
