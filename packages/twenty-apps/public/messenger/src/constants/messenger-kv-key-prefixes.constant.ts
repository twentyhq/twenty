export const MESSENGER_KV_KEY_PREFIXES = {
  connectedAccountIdByPageId: 'messenger-page-connection:',
  pageIdsByConnectedAccountId: 'messenger-connection-pages:',
  personIdByPageScopedId: 'messenger-person:',
  backfillCompletedByPageId: 'messenger-backfill-completed:',
} as const;
