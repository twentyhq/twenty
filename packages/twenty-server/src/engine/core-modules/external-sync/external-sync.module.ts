import { Module } from '@nestjs/common';

import { InboundEventLedgerService } from './inbound/inbound-event-ledger.service';
import { OutboundEventLedgerService } from './outbound/outbound-event-ledger.service';
import { DeadLetterService, ConflictService, CheckpointService, ReconciliationService } from './dead-letter/dead-letter.service';
import { TransactionalOutboxService } from './outbox/transactional-outbox.service';
import { OutboxScopingGuard } from './outbox/outbox-scoping-guard.util';

@Module({
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
