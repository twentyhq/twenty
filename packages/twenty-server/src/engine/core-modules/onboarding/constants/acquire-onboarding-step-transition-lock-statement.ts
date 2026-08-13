export const ACQUIRE_ONBOARDING_STEP_TRANSITION_LOCK_STATEMENT =
  'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))';
