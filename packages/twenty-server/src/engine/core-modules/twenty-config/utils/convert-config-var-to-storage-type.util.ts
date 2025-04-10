import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

/**
 * Convert an environment variable value to a format suitable for database storage
 */
export const convertConfigVarToStorageType = <T extends keyof ConfigVariables>(
  appValue: ConfigVariables[T],
): JSON | undefined => {
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
};
