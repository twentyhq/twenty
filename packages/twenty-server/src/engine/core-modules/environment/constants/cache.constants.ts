// TTL values in milliseconds
export const POSITIVE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
export const NEGATIVE_CACHE_TTL = 60 * 1000; // 1 minute
export const CACHE_SCAVENGE_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const MAX_CACHE_ENTRIES = 1000; // Maximum number of entries in cache

// Retry configuration
export const INITIAL_RETRY_DELAY = 1000; // 1 second
export const MAX_RETRY_ATTEMPTS = 3;
