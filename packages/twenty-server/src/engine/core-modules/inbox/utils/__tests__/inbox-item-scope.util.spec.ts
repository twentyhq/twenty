import { type FindOperator } from 'typeorm';

import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';
import {
  buildInboxItemScopeCriteria,
  buildInboxItemUnreadCriteria,
  getInboxItemScope,
  isInboxItemUnread,
} from 'src/engine/core-modules/inbox/utils/inbox-item-scope.util';

const NOW = new Date('2026-08-07T12:00:00.000Z');
const EARLIER = new Date('2026-08-07T10:00:00.000Z');
const LATER = new Date('2026-08-07T14:00:00.000Z');

const buildInboxItem = (
  overrides: Partial<InboxItemEntity> = {},
): InboxItemEntity =>
  ({
    lastEventAt: EARLIER,
    clearedAt: null,
    resurfaceAt: null,
    readAt: null,
    ...overrides,
  }) as InboxItemEntity;

describe('getInboxItemScope', () => {
  it('should keep an item that was never cleared in the inbox', () => {
    // Act
    const scope = getInboxItemScope(buildInboxItem(), NOW);

    // Assert
    expect(scope).toBe(InboxItemScope.INBOX);
  });

  it('should report a cleared item as done', () => {
    // Act
    const scope = getInboxItemScope(buildInboxItem({ clearedAt: NOW }), NOW);

    // Assert
    expect(scope).toBe(InboxItemScope.DONE);
  });

  it('should report a clear that has not expired yet as snoozed', () => {
    // Act
    const scope = getInboxItemScope(
      buildInboxItem({ clearedAt: NOW, resurfaceAt: LATER }),
      NOW,
    );

    // Assert
    expect(scope).toBe(InboxItemScope.SNOOZED);
  });

  it('should bring an item back once its resurfacing time has passed', () => {
    // Act
    const scope = getInboxItemScope(
      buildInboxItem({ clearedAt: EARLIER, resurfaceAt: EARLIER }),
      NOW,
    );

    // Assert
    expect(scope).toBe(InboxItemScope.INBOX);
  });

  it('should bring a done item back when its subject does something new', () => {
    // Act
    const scope = getInboxItemScope(
      buildInboxItem({ clearedAt: EARLIER, lastEventAt: NOW }),
      NOW,
    );

    // Assert
    expect(scope).toBe(InboxItemScope.INBOX);
  });

  it('should wake a snoozed item early when its subject does something new', () => {
    // Act
    const scope = getInboxItemScope(
      buildInboxItem({
        clearedAt: EARLIER,
        resurfaceAt: LATER,
        lastEventAt: NOW,
      }),
      NOW,
    );

    // Assert
    expect(scope).toBe(InboxItemScope.INBOX);
  });

  // The point of comparing the two timestamps rather than storing a verdict:
  // an event that happened after the clear wins even if its write landed first.
  it('should not let a clear swallow an event that happened after it', () => {
    // Prepare
    const clearWrittenLast = buildInboxItem({
      lastEventAt: new Date('2026-08-07T10:00:00.001Z'),
      clearedAt: new Date('2026-08-07T10:00:00.000Z'),
    });

    // Act
    const scope = getInboxItemScope(clearWrittenLast, NOW);

    // Assert
    expect(scope).toBe(InboxItemScope.INBOX);
  });
});

// The SQL is the same predicate written for Postgres, so it is pinned here
// next to the one the loaded row goes through.
describe('buildInboxItemScopeCriteria', () => {
  const renderSql = (
    criteria: Record<string, unknown>,
    column: string,
  ): string =>
    (criteria[column] as FindOperator<unknown>).getSql?.(
      `"item"."${column}"`,
    ) ?? '';

  it('should compare the clear against the event rather than reading a stored verdict', () => {
    // Act
    const sql = renderSql(
      buildInboxItemScopeCriteria(InboxItemScope.INBOX, NOW),
      'clearedAt',
    );

    // Assert
    expect(sql).toBe(
      '(NOT ("item"."clearedAt" IS NOT NULL AND "item"."lastEventAt" <= "item"."clearedAt") OR "item"."resurfaceAt" <= :now)',
    );
  });

  it('should separate snoozed from done by whether the clear expires', () => {
    // Act
    const snoozed = buildInboxItemScopeCriteria(InboxItemScope.SNOOZED, NOW);
    const done = buildInboxItemScopeCriteria(InboxItemScope.DONE, NOW);

    // Assert
    // Both stand on the same clear-is-current test, so it is pinned rather
    // than only compared to itself
    const clearIsCurrent =
      '("item"."clearedAt" IS NOT NULL AND "item"."lastEventAt" <= "item"."clearedAt")';

    expect(renderSql(snoozed, 'clearedAt')).toBe(clearIsCurrent);
    expect(renderSql(done, 'clearedAt')).toBe(clearIsCurrent);
    expect(snoozed.resurfaceAt).not.toEqual(done.resurfaceAt);
  });

  it('should read unread off the same comparison', () => {
    // Act
    const sql = renderSql(buildInboxItemUnreadCriteria(), 'readAt');

    // Assert
    expect(sql).toBe(
      '("item"."readAt" IS NULL OR "item"."lastEventAt" > "item"."readAt")',
    );
  });
});

describe('isInboxItemUnread', () => {
  it('should treat an item nobody opened as unread', () => {
    // Act & Assert
    expect(isInboxItemUnread(buildInboxItem())).toBe(true);
  });

  it('should treat an item read after its last event as read', () => {
    // Act & Assert
    expect(isInboxItemUnread(buildInboxItem({ readAt: NOW }))).toBe(false);
  });

  it('should make a read item unread again when its subject does something new', () => {
    // Act & Assert
    expect(
      isInboxItemUnread(buildInboxItem({ readAt: EARLIER, lastEventAt: NOW })),
    ).toBe(true);
  });
});
