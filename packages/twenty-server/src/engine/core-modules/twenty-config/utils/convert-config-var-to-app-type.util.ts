import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

/**
 * Convert a database value to the appropriate type for the environment variable
 */
export const convertConfigVarToAppType = <T extends keyof ConfigVariables>(
  dbValue: unknown,
  key: T,
): ConfigVariables[T] => {
  if (dbValue === null || dbValue === undefined) {
    return dbValue as ConfigVariables[T];
  }

  // Get the default value to determine the expected type
  const defaultValue = new ConfigVariables()[key];
  const valueType = typeof defaultValue;

  if (valueType === 'boolean' && typeof dbValue === 'string') {
    return (dbValue === 'true') as unknown as ConfigVariables[T];
  }

  if (valueType === 'number' && typeof dbValue === 'string') {
    return Number(dbValue) as unknown as ConfigVariables[T];
  }

  // Handle arrays and other complex types
  if (Array.isArray(defaultValue) && typeof dbValue === 'object') {
    return dbValue as ConfigVariables[T];
  }

  return dbValue as ConfigVariables[T];
};
