import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, IsNull, MoreThan, Raw } from 'typeorm';

import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';

// One predicate written twice, in the language that reads a loaded row and the
// language that filters in Postgres. They are kept next to each other so the
// two never drift into separate notions of "handled".
type InboxItemAttention = Pick<
  InboxItemEntity,
  'lastEventAt' | 'clearedAt' | 'resurfaceAt' | 'readAt'
>;

const toTime = (date: Date): number => date.getTime();

// A clear that predates the latest event has been superseded by it. Comparing
// the two instead of storing the answer is what makes the order the writes
// landed in irrelevant.
const isClearCurrent = (inboxItem: InboxItemAttention): boolean =>
  isDefined(inboxItem.clearedAt) &&
  toTime(inboxItem.lastEventAt) <= toTime(inboxItem.clearedAt);

export const getInboxItemScope = (
  inboxItem: InboxItemAttention,
  now: Date,
): InboxItemScope => {
  if (!isClearCurrent(inboxItem)) {
    return InboxItemScope.INBOX;
  }

  if (!isDefined(inboxItem.resurfaceAt)) {
    return InboxItemScope.DONE;
  }

  return toTime(inboxItem.resurfaceAt) > toTime(now)
    ? InboxItemScope.SNOOZED
    : InboxItemScope.INBOX;
};

export const isInboxItemUnread = (inboxItem: InboxItemAttention): boolean =>
  !isDefined(inboxItem.readAt) ||
  toTime(inboxItem.lastEventAt) > toTime(inboxItem.readAt);

// TypeORM hands the callback one qualified column, so the others in the same
// predicate are built from its table. Its quoting is not guaranteed, so the
// table is unquoted and requoted rather than passed through: an unquoted alias
// reaches Postgres as a missing FROM-clause entry.
const siblingColumn = (columnAlias: string, column: string): string => {
  const tableAlias = columnAlias
    .slice(0, columnAlias.lastIndexOf('.'))
    .replace(/"/g, '');

  return `"${tableAlias}"."${column}"`;
};

const clearIsCurrentSql = (clearedAt: string): string =>
  `(${clearedAt} IS NOT NULL AND ${siblingColumn(clearedAt, 'lastEventAt')} <= ${clearedAt})`;

const wantsAttentionSql = (clearedAt: string): string =>
  `(NOT ${clearIsCurrentSql(clearedAt)} OR ${siblingColumn(clearedAt, 'resurfaceAt')} <= :now)`;

const isUnreadSql = (readAt: string): string =>
  `(${readAt} IS NULL OR ${siblingColumn(readAt, 'lastEventAt')} > ${readAt})`;

export const buildInboxItemScopeCriteria = (
  scope: InboxItemScope,
  now: Date,
): FindOptionsWhere<InboxItemEntity> => {
  switch (scope) {
    case InboxItemScope.INBOX:
      return { clearedAt: Raw(wantsAttentionSql, { now }) };
    case InboxItemScope.SNOOZED:
      return { clearedAt: Raw(clearIsCurrentSql), resurfaceAt: MoreThan(now) };
    case InboxItemScope.DONE:
      return { clearedAt: Raw(clearIsCurrentSql), resurfaceAt: IsNull() };
  }
};

export const buildInboxItemUnreadCriteria =
  (): FindOptionsWhere<InboxItemEntity> => ({ readAt: Raw(isUnreadSql) });
