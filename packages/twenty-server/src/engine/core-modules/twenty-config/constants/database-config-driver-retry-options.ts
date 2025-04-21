export const DATABASE_CONFIG_DRIVER_RETRY_OPTIONS = {
  retries: 5,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 30000,
  randomize: true, // adds jitter
};
