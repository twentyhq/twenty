export const AGENT_CHAT_ADVISORY_LOCK_QUERY_BY_MODE = {
  shared: 'SELECT pg_advisory_xact_lock_shared(hashtextextended($1, 0))',
  exclusive: 'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
} as const;
