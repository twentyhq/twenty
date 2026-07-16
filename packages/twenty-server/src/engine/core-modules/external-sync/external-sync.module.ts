import { Module } from '@nestjs/common';

import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';

import { InboundEventLedgerService } from './inbound/inbound-event-ledger.service';
import { OutboundEventLedgerService } from './outbound/outbound-event-ledger.service';
import { DeadLetterService, ConflictService, CheckpointService, ReconciliationService } from './dead-letter/dead-letter.service';
import { TransactionalOutboxService } from './outbox/transactional-outbox.service';
import { OutboxScopingGuard } from './outbox/outbox-scoping-guard.util';
import { EntitySubscriber } from './outbox/entity-subscriber';
import { OutboxRelayProcessor } from './outbox/outbox-relay.processor';
import { EntityEventsToSyncQueueListener } from './entity-events-to-sync-queue.listener';
import { InboundSyncProcessor } from './consumers/inbound-sync.processor';
import { OutboundSyncProcessor } from './consumers/outbound-sync.processor';

@Module({
  imports: [MessageQueueModule],
  providers: [
    // Inbound
    InboundEventLedgerService,

    // Outbound
    OutboundEventLedgerService,

    // Dead letter + secondary services
    DeadLetterService,
    ConflictService,
    CheckpointService,
    ReconciliationService,

    // Outbox
    TransactionalOutboxService,
    OutboxScopingGuard,
    EntitySubscriber,
    OutboxRelayProcessor,

    // Listeners
    EntityEventsToSyncQueueListener,

    // Consumers
    InboundSyncProcessor,
    OutboundSyncProcessor,
  ],
  exports: [
    InboundEventLedgerService,
    OutboundEventLedgerService,
    DeadLetterService,
    ConflictService,
    CheckpointService,
    ReconciliationService,
    TransactionalOutboxService,
    OutboxScopingGuard,
  ],
})
export class ExternalSyncModule {}
