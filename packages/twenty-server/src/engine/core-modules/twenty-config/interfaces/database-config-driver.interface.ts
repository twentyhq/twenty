import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

/**
 * Interface for drivers that support database-backed configuration
 * with caching and initialization capabilities
 */
export interface DatabaseConfigDriverInterface {
  /**
   * Get a configuration value
   */
  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T];

  /**
   * Initialize the driver
   */
  initialize(): Promise<void>;

  /**
   * Clear a specific key from cache
   */
  clearCache(key: keyof ConfigVariables): void;

  /**
   * Refresh a specific configuration from its source
   */
  refreshConfig(key: keyof ConfigVariables): Promise<void>;
}
