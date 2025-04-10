import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TypedReflect } from 'src/utils/typed-reflect';

/**
 * Checks if the environment variable is environment-only based on metadata
 */
export const isEnvOnlyConfigVar = (key: keyof ConfigVariables): boolean => {
  const metadata =
    TypedReflect.getMetadata('config-variables', ConfigVariables) ?? {};
  const envMetadata = metadata[key];

  return !!envMetadata?.isEnvOnly;
};
