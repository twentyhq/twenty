// SQL over a chat aliased "thread" and the member's row aliased
// "participant", mirroring how the inbox derives a chat's place on the
// client. A chat in a channel is only the member's once they follow it or
// filed it themselves; any other chat they can read is theirs.
const isActiveAfter = (column: string) =>
  `COALESCE(thread."lastActivityAt" > ${column}, false)`;

const IS_SUBSCRIBED = `COALESCE(participant."isSubscribed", thread."channelId" IS NULL)`;

const IS_MINE = `(thread."channelId" IS NULL OR COALESCE(participant."isSubscribed", false) OR participant."archivedAt" IS NOT NULL)`;

const IS_OPEN = `(${IS_SUBSCRIBED} AND (participant."archivedAt" IS NULL OR ${isActiveAfter('participant."archivedAt"')}))`;

const IS_SNOOZED = `(${IS_SUBSCRIBED} AND participant."archivedAt" IS NOT NULL AND participant."snoozedUntil" IS NOT NULL AND NOT ${isActiveAfter('participant."archivedAt"')})`;

const IS_DONE = `(${IS_MINE} AND (NOT ${IS_SUBSCRIBED} OR (participant."archivedAt" IS NOT NULL AND participant."snoozedUntil" IS NULL AND NOT ${isActiveAfter('participant."archivedAt"')})))`;

const IS_UNREAD = `(thread."lastActivityAt" IS NOT NULL AND (participant."lastReadAt" IS NULL OR thread."lastActivityAt" > participant."lastReadAt"))`;

const IS_OPEN_IN_CHANNEL = `(thread."channelArchivedAt" IS NULL OR ${isActiveAfter('thread."channelArchivedAt"')})`;

const IS_SNOOZED_IN_CHANNEL = `(thread."channelArchivedAt" IS NOT NULL AND thread."channelSnoozedUntil" IS NOT NULL AND NOT ${isActiveAfter('thread."channelArchivedAt"')})`;

const IS_DONE_IN_CHANNEL = `(thread."channelArchivedAt" IS NOT NULL AND thread."channelSnoozedUntil" IS NULL AND NOT ${isActiveAfter('thread."channelArchivedAt"')})`;

export const AGENT_CHAT_INBOX_VIEW_PREDICATES = {
  IS_MINE,
  IS_OPEN,
  IS_SNOOZED,
  IS_DONE,
  IS_UNREAD,
  IS_OPEN_IN_CHANNEL,
  IS_SNOOZED_IN_CHANNEL,
  IS_DONE_IN_CHANNEL,
} as const;
