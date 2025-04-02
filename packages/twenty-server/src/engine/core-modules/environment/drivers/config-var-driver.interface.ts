import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';

/**
 * Interface for drivers that support database-backed configuration
 * with caching and initialization capabilities
 */
export interface ConfigVarDriver {
  /**
   * Get a configuration value
   */
  get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T];

  /**
   * Initialize the driver
   */
  initialize(): Promise<void>;

  /**
   * Clear a specific key from cache
   */
  clearCache(key: keyof EnvironmentVariables): void;

  /**
   * Refresh a specific configuration from its source
   */
  refreshConfig(key: keyof EnvironmentVariables): Promise<void>;
}
