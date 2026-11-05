// Longer than the 7-day maximum job delay, so a charge outlives any job that can still be released
export const JOB_MEMORY_CHARGE_TTL_SECONDS = 8 * 24 * 60 * 60;

export const JOB_MEMORY_INFO_CACHE_MS = 1_000;

// Not charged: system jobs keep the platform running and are bounded by design
export const JOB_MEMORY_UNCHARGED_GROUP_KEY = 'system';
