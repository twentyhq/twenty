import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

/**
 * Interface for drivers that support database-backed configuration
 * with caching and initialization capabilities
 */
export interface DatabaseConfigDriverInterface {
  /**
   * Initialize the driver
   */
  initialize(): Promise<void>;

  /**
   * Get a configuration value
   */
  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T];

  /**
   * Update a configuration value in the database and cache
   */
  update<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void>;

  /**
   * Fetch and cache a specific configuration from its source
   */
  fetchAndCacheConfigVariable(key: keyof ConfigVariables): Promise<void>;

  /**
   * Proactively refreshes expired entries in the config cache
   */
  refreshExpiredCache(): Promise<void>;
}
