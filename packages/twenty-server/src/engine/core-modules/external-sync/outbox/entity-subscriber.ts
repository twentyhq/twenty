import { Injectable, Logger } from '@nestjs/common';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

import { TransactionalOutboxService } from './transactional-outbox.service';
import { OutboxScopingGuard } from './outbox-scoping-guard.util';

/**
 * TypeORM entity subscriber for the transactional outbox.
 *
 * Registers AfterInsert/AfterUpdate listeners on workspace entities.
 * Uses listenTo() scoped to executive-profile entities only —
 * explicitly excludes the sync tables to prevent recursion.
 *
 * Implementation note: Workspace objects use dynamically-generated
 * EntitySchema targets. If listenTo() doesn't work with dynamic schemas,
 * fall back to @OnDatabaseBatchEvent (post-commit, weaker guarantee).
 */
@Injectable()
@EventSubscriber()
export class EntitySubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(EntitySubscriber.name);

  /** Names of sync tables that MUST NOT trigger outbox writes (recursion prevention). */
  private readonly syncTableNames = new Set([
    'externalSyncOutbox',
    'externalSyncInboundEvent',
    'externalSyncOutboundEvent',
    'externalSyncDeadLetter',
    'externalSyncConflict',
    'externalSyncCheckpoint',
    'externalSyncReconciliationRun',
    'externalSyncReconciliationFinding',
  ]);

  constructor(
    private readonly outboxService: TransactionalOutboxService,
    private readonly scopingGuard: OutboxScopingGuard,
  ) {}

  /**
   * Listen to all entities. We filter in the callbacks.
   * With dynamic EntitySchema targets, listenTo() returning the base
   * workspace entity class is the practical approach.
   */
  listenTo(): Function | string | undefined {
    // Return undefined to listen to all entities — we filter by name
    return undefined;
  }

  async afterInsert(event: InsertEvent<Record<string, unknown>>): Promise<void> {
    await this.handleEntityEvent(event.metadata?.tableName, event.entity, event);
  }

  async afterUpdate(event: UpdateEvent<Record<string, unknown>>): Promise<void> {
    await this.handleEntityEvent(
      event.metadata?.tableName,
      event.entity as Record<string, unknown>,
      event,
    );
  }

  private async handleEntityEvent(
    tableName: string | undefined,
    entity: Record<string, unknown> | undefined,
    _event: InsertEvent<Record<string, unknown>> | UpdateEvent<Record<string, unknown>>,
  ): Promise<void> {
    // Skip sync tables to prevent recursion
    if (!tableName || this.syncTableNames.has(tableName)) {
      return;
    }

    if (!entity) {
      return;
    }

    // At PR2 time we don't know which objects are executive-profile entities.
    // The scoping guard handles this: no externalEntityLink table → no-op.
    const workspaceId = (entity as Record<string, unknown>).workspaceId as string;
    if (!workspaceId) {
      return;
    }

    const isEnabled = await this.scopingGuard.isSyncEnabled(workspaceId, tableName);
    if (!isEnabled) {
      return;
    }

    // PR2: scoping guard returns false, so we don't reach here yet.
    // PR4: append outbox row when sync is enabled for this object.
    this.logger.debug(
      `Entity ${tableName} is sync-enabled, appending outbox entry`,
    );

    await this.outboxService.append({
      eventId: crypto.randomUUID(),
      idempotencyKey: `${workspaceId}::${tableName}::${entity.id ?? crypto.randomUUID()}`,
      sourceSystem: 'TWENTY',
      eventType: tableName,
      payload: entity as Record<string, unknown>,
    });
  }
}
