import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

/**
 * Interface for drivers that support database-backed configuration
 * with caching capabilities
 */
export interface DatabaseConfigDriverInterface {
  /**
   * Get a configuration value from cache
   * Returns undefined if not in cache
   */
  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] | undefined;

  /**
   * Update a configuration value in the database and cache
   */
  update<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void>;

  /**
   * Refreshes all entries in the config cache
   */
  refreshAllCache(): Promise<void>;

  /**
   * Get information about the cache state
   */
  getCacheInfo(): {
    foundConfigValues: number;
    knownMissingKeys: number;
    cacheKeys: string[];
  };
}
