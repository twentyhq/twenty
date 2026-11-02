export const AGENT_CHAT_IS_IN_INBOX_PREDICATE = `(participant."isSubscribed" AND (participant."archivedAt" IS NULL OR thread."lastActivityAt" > participant."archivedAt"))`;
