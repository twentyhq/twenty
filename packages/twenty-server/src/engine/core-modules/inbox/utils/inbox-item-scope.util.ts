import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, IsNull, MoreThan, Raw } from 'typeorm';

import { type InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';

// The one definition of whether an item wants attention, in both the language
// that reads a loaded row and the language that filters in Postgres. Keeping
// the two next to each other is the point: there is one predicate, written
// twice, rather than two notions of "handled".
type InboxItemAttention = Pick<
  InboxItemEntity,
  'lastEventAt' | 'clearedAt' | 'resurfaceAt' | 'readAt'
>;

const toTime = (date: Date): number => date.getTime();

// A clear holds only until the subject does something else, so a clear that
// predates the latest event has been superseded by it. Comparing the two
// instead of storing the answer is what makes the order the writes landed in
// irrelevant.
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
// predicate are built from its table. The quoting it uses is not guaranteed, so
// the table is unquoted and requoted rather than passed through: an unquoted
// alias reaches Postgres as a missing FROM-clause entry.
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
