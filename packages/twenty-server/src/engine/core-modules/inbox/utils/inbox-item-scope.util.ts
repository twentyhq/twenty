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
    return InboxItemScope.ARCHIVED;
  }

  return toTime(inboxItem.resurfaceAt) > toTime(now)
    ? InboxItemScope.SNOOZED
    : InboxItemScope.INBOX;
};

export const isInboxItemUnread = (inboxItem: InboxItemAttention): boolean =>
  !isDefined(inboxItem.readAt) ||
  toTime(inboxItem.lastEventAt) > toTime(inboxItem.readAt);

// One predicate, written once against a table alias and reused by both callers:
// the TypeORM `Raw` filters below and the grouped count that cannot express
// itself as a FindOptions tree. Keeping them in terms of the same builders is
// what stops two notions of "handled" from drifting apart.
const buildClearIsCurrentSql = (alias: string): string =>
  `("${alias}"."clearedAt" IS NOT NULL AND "${alias}"."lastEventAt" <= "${alias}"."clearedAt")`;

export const buildWantsAttentionSql = (alias: string): string =>
  `(NOT ${buildClearIsCurrentSql(alias)} OR "${alias}"."resurfaceAt" <= :now)`;

export const buildIsUnreadSql = (alias: string): string =>
  `("${alias}"."readAt" IS NULL OR "${alias}"."lastEventAt" > "${alias}"."readAt")`;

// TypeORM hands the callback one qualified column, and its quoting is not
// guaranteed, so the table is unquoted and requoted rather than passed through:
// an unquoted alias reaches Postgres as a missing FROM-clause entry.
const aliasOf = (columnAlias: string): string =>
  columnAlias.slice(0, columnAlias.lastIndexOf('.')).replace(/"/g, '');

const clearIsCurrentSql = (clearedAt: string): string =>
  buildClearIsCurrentSql(aliasOf(clearedAt));

const wantsAttentionSql = (clearedAt: string): string =>
  buildWantsAttentionSql(aliasOf(clearedAt));

const isUnreadSql = (readAt: string): string =>
  buildIsUnreadSql(aliasOf(readAt));

export const buildInboxItemScopeCriteria = (
  scope: InboxItemScope,
  now: Date,
): FindOptionsWhere<InboxItemEntity> => {
  switch (scope) {
    case InboxItemScope.INBOX:
      return { clearedAt: Raw(wantsAttentionSql, { now }) };
    case InboxItemScope.SNOOZED:
      return { clearedAt: Raw(clearIsCurrentSql), resurfaceAt: MoreThan(now) };
    case InboxItemScope.ARCHIVED:
      return { clearedAt: Raw(clearIsCurrentSql), resurfaceAt: IsNull() };
  }
};

export const buildInboxItemUnreadCriteria =
  (): FindOptionsWhere<InboxItemEntity> => ({ readAt: Raw(isUnreadSql) });
