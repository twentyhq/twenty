// Also how rewards are told apart when reading grants back, so changing a
// prefix orphans every reward already granted under it.
export const ONBOARDING_REWARD_IDEMPOTENCY_KEY_PREFIXES = {
  importContacts: 'onboarding-import-contacts',
  installApps: 'onboarding-install-apps',
  inviteTeam: 'onboarding-invite-team',
  enrichmentQualification: 'onboarding-enrichment-qualified',
} as const;
