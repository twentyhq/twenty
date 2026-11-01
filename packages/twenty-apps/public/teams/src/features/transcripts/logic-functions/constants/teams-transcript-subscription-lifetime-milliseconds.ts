// Graph caps transcript subscriptions at 4,320 minutes; the margin absorbs clock skew.
export const TEAMS_TRANSCRIPT_SUBSCRIPTION_LIFETIME_MILLISECONDS =
  (4_320 - 5) * 60 * 1_000;
