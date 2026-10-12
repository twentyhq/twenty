// An app deduplicates a new or reconnected connection from its queued
// onConnect handler, a few seconds after the OAuth callback saved it.
export const APP_CONNECTION_ON_CONNECT_REFETCH = {
  recentCredentialsChangeWindowInMs: 60_000,
  refetchDelayInMs: 5_000,
};
