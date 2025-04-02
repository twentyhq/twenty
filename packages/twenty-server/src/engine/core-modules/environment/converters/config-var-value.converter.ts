import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';
import { TypedReflect } from 'src/utils/typed-reflect';

/**
 * Handles type conversions for environment variables
 * when storing and retrieving them from the database.
 */
export class ConfigVarValueConverter {
  /**
   * Convert a database value to the appropriate type for the environment variable
   */
  static toAppType<T extends keyof EnvironmentVariables>(
    dbValue: unknown,
    key: T,
  ): EnvironmentVariables[T] {
    if (dbValue === null || dbValue === undefined) {
      return dbValue as EnvironmentVariables[T];
    }

    // Get the default value to determine the expected type
    // UGLY
    const defaultValue = new EnvironmentVariables()[key];
    const valueType = typeof defaultValue;

    if (valueType === 'boolean' && typeof dbValue === 'string') {
      return (dbValue === 'true') as unknown as EnvironmentVariables[T];
    }

    if (valueType === 'number' && typeof dbValue === 'string') {
      return Number(dbValue) as unknown as EnvironmentVariables[T];
    }

    // Handle arrays and other complex types
    if (Array.isArray(defaultValue) && typeof dbValue === 'object') {
      return dbValue as EnvironmentVariables[T];
    }

    return dbValue as EnvironmentVariables[T];
  }

  /**
   * Convert an environment variable value to a format suitable for database storage
   */
  static toStorageType<T extends keyof EnvironmentVariables>(
    appValue: EnvironmentVariables[T],
  ): JSON | undefined {
    if (appValue === undefined) {
      return undefined;
    }

    // Convert to the appropriate type for JSON storage
    if (typeof appValue === 'boolean') {
      return appValue as unknown as JSON;
    }

    if (typeof appValue === 'number') {
      return appValue as unknown as JSON;
    }

    if (typeof appValue === 'string') {
      return appValue as unknown as JSON;
    }

    // For arrays and objects, ensure they're stored as JSON-compatible values
    if (Array.isArray(appValue) || typeof appValue === 'object') {
      return appValue as unknown as JSON;
    }

    return appValue as unknown as JSON;
  }

  /**
   * Checks if the environment variable is environment-only based on metadata
   */
  static isEnvOnly(key: keyof EnvironmentVariables): boolean {
    const metadata =
      TypedReflect.getMetadata('environment-variables', EnvironmentVariables) ??
      {};
    const envMetadata = metadata[key];

    return !!envMetadata?.isEnvOnly;
  }
}
