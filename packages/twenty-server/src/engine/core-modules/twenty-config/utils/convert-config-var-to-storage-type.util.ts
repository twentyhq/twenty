import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

/**
 * Convert an environment variable value to a format suitable for database storage
 */
export const convertConfigVarToStorageType = <T extends keyof ConfigVariables>(
  appValue: ConfigVariables[T],
): unknown => {
  if (appValue === undefined) {
    return null;
  }

  if (
    typeof appValue === 'string' ||
    typeof appValue === 'number' ||
    typeof appValue === 'boolean' ||
    appValue === null
  ) {
    return appValue;
  }

  if (Array.isArray(appValue)) {
    return appValue.map((item) =>
      convertConfigVarToStorageType<keyof ConfigVariables>(
        item as ConfigVariables[keyof ConfigVariables],
      ),
    );
  }

  if (typeof appValue === 'object') {
    return JSON.parse(JSON.stringify(appValue));
  }

  throw new Error(
    `Cannot convert value of type ${typeof appValue} to storage format`,
  );
};
